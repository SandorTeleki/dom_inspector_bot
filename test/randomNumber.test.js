import { expect, test } from 'vitest';
import { getRandomNumber } from '../utils/randomNumber'

test('returns a random integer between 0 and the provided number (100)', () => {
    expect(getRandomNumber(100)).toBeLessThan(100)
})