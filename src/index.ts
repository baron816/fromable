const mapSymbol = Symbol();
const filterSymbol = Symbol();

interface MapObj {
  readonly type: typeof mapSymbol;
  fn: (value: any, index: number) => any;
}

interface FilterObj {
  readonly type: typeof filterSymbol;
  fn: (value: any, index: number) => boolean;
}

type Collection = Map<any, any>
| Set<any>
| { [key: string]: any }
| any[]
| string
| number;

type GetTuplePosition<T, N extends number> = T extends any[] ? T[N] : never;

type CollectionResult<T, R>  =
    T extends Set<any> ? Set<R> : 
    T extends number ? number :
    T extends string ? string :
    T extends any[] ? R[] :
    T extends Map<any, any> ? Map<GetTuplePosition<R, 0>, GetTuplePosition<R, 1>> :
    T extends {} ? { [key: string]: GetTuplePosition<R, 1> }:
    unknown;

class From<T> {
  callers: Array<MapObj | FilterObj>

  constructor(readonly iterable: Iterable<T>) {
    this.iterable = iterable;
    this.callers = [];
  }

  /**
   * For each value in the iterable, it will call the mapper and add the result to the collection.
   * 
   * @param mapper A pure function that transforms any value.
   */
  map<B>(mapper: (value: T, index: number) => B): From<B> {
    this.callers.push({
      type: mapSymbol,
      fn: mapper
    });

    // @ts-ignore
    return this;
  }

  /**
   * For each value in the iterable, it will call the predicate with the current value, and the index, only advancing values that advance to true.
   * 
   * @param predicate A pure functions that returns true or false.
   */
  filter(predicate: (value: T, index: number) => boolean): From<T> {
    this.callers.push({
      type: filterSymbol,
      fn: predicate
    });

    return this;
  }

  /**
   * Will invoke all chained map and fitlers on the iterable, adding the result to the collection.
   * 
   * @param collection The resulting collection.
   * @param combinerFn A custom combiner function for collecting values into the collection. If ommitted, will use default combiners based on the collection type.
   */
  into<J extends Collection>(collection: J, combinerFn?: (collection: J, val: any) => J): CollectionResult<J, T> {
    function combine(val: any) {
      if (combinerFn != null) {
        collection = combinerFn(collection, val);
      } else if (Array.isArray(collection)) {
        collection.push(val);
      } else if (collection instanceof Set) {
        collection.add(val);
      } else if (collection instanceof Map) {
        if (Array.isArray(val)) {
            collection.set(val[0], val[1]);
        } else {
            throw Error(`Collecting into a Map requires a tuple array, with the key in
            the first position and the value in the second`);
        }
      } else if (typeof collection === "object") {
        if (Array.isArray(val)) {
            const [key, value] = val;
            (collection as { [key: string]: any })[key] = value;
        } else {
            throw Error(`Collecting into an Object requires a tuple array, with the key in
            the first position and the value in the second`); 
        }
      } else if (typeof collection === "string") {
        (collection as string) += val;
      } else if (typeof collection === "number") {
        (collection as number) += val;
      }
    }

    const noValue = Symbol();
    let counter = 0;
    const filteredCounts = [0];
    for (const val of this.iterable) {
      const possibleResult = this.callers.reduce(
        (acc, curr, idx) => {
            if (acc === noValue) {
                return acc;
            }
            
            const valueIndex = counter - (filteredCounts.slice(0, idx + 1).reduce((a, b) => a + b));
            
            switch (curr.type) {
                case mapSymbol:
              return curr.fn(acc, valueIndex);
            case filterSymbol:
              if (curr.fn(acc, valueIndex)) {
                return acc;
              } else {
                filteredCounts[idx + 1] = (filteredCounts[idx + 1] ?? 0) + 1;
                return noValue;
              }
            default:
              return acc;
          }
        },
        val as (T | typeof noValue)
      );

      if (possibleResult !== noValue) {
        combine(possibleResult);
      }
      counter += 1;
    }

    return collection as CollectionResult<J, T>;
  }
}

/**
 * 
 * @param a any Iterable
 * Allows for chaining of `.map` and `.filter` on any Iterable and collecting
 * result into a collection without creating intermediate collections.
 */
export function from<A>(a: Iterable<A>): From<A> {
  return new From(a);
}
