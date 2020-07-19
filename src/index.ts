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

type Collection =
  | Map<any, any>
  | Set<any>
  | { [key: string]: any }
  | any[]
  | string
  | number;

type GetTuplePosition<T, N extends number> = T extends any[] ? T[N] : never;

type CollectionResult<T, R> = T extends Set<any>
  ? Set<R>
  : T extends number
  ? number
  : T extends string
  ? string
  : T extends any[]
  ? R[]
  : T extends Map<any, any>
  ? Map<GetTuplePosition<R, 0>, GetTuplePosition<R, 1>>
  : T extends {}
  ? { [key: string]: GetTuplePosition<R, 1> }
  : unknown;

function* zipIterables<T>(
  ...iterables: Array<Iterable<T> | never>
): Iterable<Array<T | undefined>> {
  const gens = iterables.map((iter) => iter[Symbol.iterator]());

  function nextAll() {
    return gens.map((g) => g.next());
  }

  let nextObjs = nextAll();

  while (!nextObjs.every((v) => v.done)) {
    yield nextObjs.map((v) => v.value);
    nextObjs = nextAll();
  }
}

type Position<U extends any[], N extends number> = U[N] extends any[]
  ? U[N][0] | undefined
  : never;

class From<T, U extends Array<Iterable<any> | never>> {
  callers: Array<MapObj | FilterObj>;
  readonly iterable: Iterable<T> | Iterable<(T | undefined)[]>;

  constructor(iterable: Iterable<T>, ...optionalIterables: U) {
    this.iterable =
      optionalIterables.length > 0
        ? zipIterables(iterable, ...optionalIterables)
        : iterable;
    this.callers = [];
  }

  /**
   * For each value in the iterable, it will call the mapper and add the result to the collection.
   *
   * @param mapper A function that transforms any value.
   */
  map<B>(
    mapper: (
      value: U extends never[]
        ? T
        : U[10] extends undefined
        ? [
            T | undefined,
            Position<U, 0>,
            Position<U, 1>,
            Position<U, 2>,
            Position<U, 3>,
            Position<U, 4>,
            Position<U, 5>,
            Position<U, 6>,
            Position<U, 7>,
            Position<U, 8>,
            Position<U, 9>
          ]
        : T[],
      index: number
    ) => B
  ): From<B, never[]> {
    this.callers.push({
      type: mapSymbol,
      fn: mapper,
    });

    // @ts-ignore
    return this;
  }

  /**
   * For each value in the iterable, it will call the predicate with the current value, and the index, only advancing values that advance to true.
   *
   * @param predicate A functions that returns true or false.
   */
  filter(predicate: (value: T, index: number) => boolean): From<T, U> {
    this.callers.push({
      type: filterSymbol,
      fn: predicate,
    });

    return this;
  }

  /**
   * Will invoke all chained map and fitlers on the iterable, adding the result to the collection.
   *
   * @param collection The resulting collection.
   * @param combinerFn A custom combiner function for collecting values into the collection. If ommitted, will use default combiners based on the collection type.
   */
  into<J extends Collection>(
    collection: J,
    combinerFn?: (collection: J, val: any) => J
  ): CollectionResult<J, T> {
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
      let possibleResult = val as T | typeof noValue;

      this.callers.forEach((curr, idx) => {
        if (possibleResult === noValue) {
          return;
        }

        const valueIndex =
          counter - filteredCounts.slice(0, idx + 1).reduce((a, b) => a + b);

        switch (curr.type) {
          case mapSymbol:
            possibleResult = curr.fn(possibleResult, valueIndex);
            return;
          case filterSymbol:
            if (curr.fn(possibleResult, valueIndex)) {
              return;
            } else {
              filteredCounts[idx + 1] = (filteredCounts[idx + 1] ?? 0) + 1;
              possibleResult = noValue;
              return;
            }
          default:
            return;
        }
      });

      if (possibleResult !== noValue) {
        combine(possibleResult);
      }
      counter += 1;
    }

    return collection as CollectionResult<J, T>;
  }
}

/**
 * Allows for chaining of `.map` and `.filter` on any Iterable and collecting
 * result into a collection without creating intermediate collections.
 *
 * If other iterables are pass in, they will be iterated over at the same time and zipped together into an array.
 *
 * @param iterable any Iterable
 * @param optionalIterables optionally other iterables that will be iteratated over at at the same time.
 */
export function from<A, B extends Iterable<any>[]>(
  iterable: Iterable<A>,
  ...optionalIterables: B
): From<A, B> {
  return new From(iterable, ...optionalIterables);
}
