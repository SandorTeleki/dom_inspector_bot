//no max, so test it with nothing, 1, 5, 100
import { describe, expect, it } from 'vitest';
import { buttonCreator } from '../utils/buttonCreator';

describe('Test button creator functionality', () => {
    it('it should return an empty array if there are no similar matches', () => {
        const similarMatchesList = [];
        const prefix = 'test';
        const buttons = buttonCreator(similarMatchesList, prefix);
        expect(buttons.length).toBe(0);
    });

    it('it should return 5 buttons if there are 5 similar matches', () => {
        const similarMatchesList = [{id: 1, name: '1'}, {id: 2, name: '2'}, {id: 3, name: '3'}, {id: 4, name: '4'}, {id: 5, name: '5'}];
        const prefix = 'test';
        const buttons = buttonCreator(similarMatchesList, prefix);
        expect(buttons.length).toBe(5);
    })
})