import "regenerator-runtime/runtime";
import { from } from '../src/index';

describe('from', () => {
    it('maps an array', () => {
        const result = from([1,2,3,4,5])
            .map(v => v + 1)
            .into([]);

        expect(result).toEqual([2,3,4,5,6])
    })

    it('filters an array', () => {
        const result = from([1,2,3,4,5])
            .filter(v => v > 3)
            .into([]);

        expect(result).toEqual([4, 5]);
    });

    it('maps and filters', () => {
        const result = from([1,2,3,4,5])
            .map(v => v + 2)
            .filter(v => v > 5)
            .into([]);

        expect(result).toEqual([6, 7])
    })

    it('maps an array of numbers into an array of strings', () => {
        const result = from([1,2,3,4,5])
            .map(String)
            .into([])
        
        expect(result).toEqual(["1", "2", "3", "4", "5"])
    })

    it('collects an array into a string', () => {
        const result = from([1,2,3,4,5])
            .into('');

        expect(result).toBe('12345');
    })

    it('collects an array into a set', () => {
        const result = from([1,2,2,3,4,4,5])
            .into(new Set())

        expect(result).toEqual(new Set([1,2,3,4,5]))
    });

    it('collects an array into a map', () => {
        const result = from([1,2,3,4,5])
            .map(v => v ** 2)
            .map((v, i) => [i, v])
            .into(new Map())

        expect(result).toEqual(new Map([[0, 1], [1, 4], [2, 9], [3, 16], [4, 25]]))
    })

    it('collects an array into an object', () => {
        const result = from([1,2,3,4,5])
            .map(v => v ** 2)
            .map(String)
            .map((v, i) => [v, i])
            .into({});

        expect(result).toEqual({ 1: 0, 4: 1, 9: 2, 16: 3, 25: 4 })
    })

    it('collects an array into a number', () => {
        const result = from([1,2,3,4,5]).into(0);

        expect(result).toBe(15)
    })

    it('gets the indexes', () => {
        const result = from([1,2,3,4,5])
            .map((v, i) => i)
            .into([]);

        expect(result).toEqual([0, 1, 2, 3, 4])
    })

    it('gets the indexes when filtered once', () => {
        const result = from([1,2,3,4,5])
            .filter(v => v > 2)
            .map((v, i) => i)
            .into([])

        expect(result).toEqual([0, 1, 2])
    })

    it('gets the indexs when filtered twice', () => {
        const result = from([1,2,3,4,5])
            .filter(v => v > 1)
            .filter(v => v > 2)
            .map((v, i) => [v, i])
            .into([])

        expect(result).toEqual([[3, 0], [4, 1], [5, 2]])
    })

    it('gets the indexes when filtered three times', () => {
        const result = from([1,2,3,4,5,6])
            .filter(v => v > 1)
            .filter(v => v !== 3)
            .filter(v => v < 6)
            .map((v, i) => [v, i])
            .into([]);

        expect(result).toEqual([[2, 0], [4, 1], [5, 2]])
    })

    it('gets the indexes when mapped and filtered', () => {
        const result = from([1,2,3,4,5,6])
            .filter(v => v % 2 === 0)
            .map(v => v ** 2)
            .filter(v => v !== 16)
            .map((v, i) => [v, i])
            .into([]);

        expect(result).toEqual([[4, 0], [36, 1]])
    })

    it('zips together iterables', () => {
        const result = from([1,2,3,4], [5,6,7,8])
            .map(([a, b]) => a + b)
            .into([])

        expect(result).toEqual([6, 8, 10, 12])
    })
})