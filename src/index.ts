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

export function from<T>(iterable: Iterable<T>) {
  const callers: Array<MapObj | FilterObj> = [];

  const api = Object.freeze({
    into,
    map,
    filter
  });

  function into<
    K extends
      | Map<any, any>
      | Set<any>
      | { [key: string]: any }
      | any[]
      | string
      | number
  >(collection: K, combinerFn?: (collection: K, val: any) => K): K {
    function combine(val: any) {
      if (combinerFn != null) {
        collection = combinerFn(collection, val);
      } else if (Array.isArray(collection)) {
        collection.push(val);
      } else if (collection instanceof Set) {
        collection.add(val);
      } else if (collection instanceof Map && Array.isArray(val)) {
        collection.set(val[0], val[1]);
      } else if (typeof collection === "string") {
        (collection as string) += val;
      } else if (typeof collection === "number") {
        (collection as number) += val;
      }
    }

    const noValue = Symbol();
    let counter = 0;
    for (const val of iterable) {
      counter += 1;
      const possibleResult = callers.reduce(
        // eslint-disable-next-line no-loop-func
        (acc, curr) => {
          if (acc === noValue) {
            return acc;
          }

          switch (curr.type) {
            case mapSymbol:
              return curr.fn(acc, counter);
            case filterSymbol:
              if (curr.fn(acc, counter)) {
                return acc;
              } else {
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
    }
    return collection;
  }

  function map<V extends T>(mapper: (value: V, index: number) => any) {
    callers.push({
      type: mapSymbol,
      fn: mapper
    });
    return api;
  }

  function filter<V extends T>(
    predicate: (value: V, index: number) => boolean
  ) {
    callers.push({
      type: filterSymbol,
      fn: predicate
    });
    return api;
  }

  return api;
}

export default { from };