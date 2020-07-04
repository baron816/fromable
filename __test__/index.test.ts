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
})