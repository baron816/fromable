import { from } from '../src/index';

describe('from', () => {
    it('maps an array', () => {
        const result = from([1,2,3,4,5])
            .map(v => v + 1)
            .into([]);

        expect(result).toEqual([2,3,4,5,6])
    })
})