# Fromable

Fromable allows you take any iterable, tranform it using `.map` and `.filter`, and then output it into a collection, without creating intermediate values.

## Motivation
`arr.filter(isSomething).map(transform);` will allocate two new arrays into memory, when you only want one. Each time you run `.filter` or `.map`, you're creating a whole new array, which will need to be cleaned up.

Additionally, it only operates on arrays. filtering/mapping on Sets/Maps/strings is not [yet](https://github.com/tc39/proposal-iterator-helpers) possible.

## Install

`npm i fromable`

## Usage

`from` will accept any Iterable (array, string, Set, Map, etc).

`into` will accept a number, string, array, Set, Map, or object. It accepts an optional second argument, which will handle combinations.

```typescript
import { from } from 'fromable'; // 😆

// chain map and filter on arrays
from([1,2,3,4,5,6])
    .map(val => val + 2)
    .filter(val => val % 2 === 0)
    .map(val => val ** 2)
    .into([]) //=> [16, 36, 64]

// accumulate into a number
from(new Set([1,2,3,4,5,6]))
    .map(val => val + 2)
    .filter(val => val > 4)
    .into(0) //=> 18

// add entries to an object
from("abc")
    .map((val, idx) => [v, i])
    .into({}, (collection, [key, val]) => {
        collection[key] = val;
        return c;
    }) //=> { a: 1, b: 2, c: 3}
```