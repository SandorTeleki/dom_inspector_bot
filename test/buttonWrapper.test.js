import { describe, expect, it } from 'vitest';
import { buttonWrapper } from '../utils/buttonWrapper';

describe('Test button wrapper functionality', () => {
    it('returns a partial row of arrays if it receives 4 buttons', () => {
        const buttons = Array.from({ length: 4 }, (_, i) => ({ id: `button${i + 1}` }));
        const components = buttonWrapper(buttons);
        expect(components.length).toBe(1);
        expect(components[0].components.length).toBe(4);
    })

    it('returns one full and a partial row of arrays if it receives 9 buttons', () => {
        const buttons = Array.from({ length: 9 }, (_, i) => ({ id: `button${i + 1}` }));
        const components = buttonWrapper(buttons);
        expect(components.length).toBe(2);
        expect(components[0].components.length).toBe(5);
        expect(components[1].components.length).toBe(4);
    })

    it('returns five full rows of arrays if it receives 25 buttons', () => {
        const buttons = Array.from({ length: 25 }, (_, i) => ({ id: `button${i + 1}` }));
        const components = buttonWrapper(buttons);
        expect(components.length).toBe(5);
        expect(components[0].components.length).toBe(5);
        expect(components[1].components.length).toBe(5);
        expect(components[2].components.length).toBe(5);
        expect(components[3].components.length).toBe(5);
        expect(components[4].components.length).toBe(5);
    })

    it('returns five full rows of arrays even if it receives more than the maximum amount of buttons', () => {
        const buttons = Array.from({ length: 30 }, (_, i) => ({ id: `button${i + 1}` }));
        const components = buttonWrapper(buttons);
        expect(components.length).toBe(5);
        expect(components[0].components.length).toBe(5);
        expect(components[1].components.length).toBe(5);
        expect(components[2].components.length).toBe(5);
        expect(components[3].components.length).toBe(5);
        expect(components[4].components.length).toBe(5);
    })

})