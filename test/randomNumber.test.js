import { describe, expect, test } from 'vitest';
import { getRandomNumber } from '../utils/randomNumber'
import { minRandomNumber, maxRandomNumber } from '../utils/utils';

describe('Test random number functionality', () => {
    test('returns a random integer between 0 and the provided number', () => {
        const input = 100;
        expect(getRandomNumber(100)).toBeLessThanOrEqual(input);
    })

    test('returns an error if the provided number is below the minimum number', () => {
        const input = 0;
        expect(getRandomNumber(input)).toEqual(`Syntax error. Please only input integers between \`${minRandomNumber}\` and \`${maxRandomNumber}\`.\nYour number was \`${Math.abs(minRandomNumber - input)}\` below the min.`)
    })

    test('returns an error if the provided number is above the maximum number', () => {
        const input = 1000;
        expect(getRandomNumber(input)).toEqual(`Syntax error. Please only input integers between \`${minRandomNumber}\` and \`${maxRandomNumber}\`.\nYour number was \`${input - maxRandomNumber}\` above the max.`)
    })

    test('returns an error if NaN (not a number) was provided', () => {
        const input = 'blah';
        expect(getRandomNumber(input)).toEqual(`Syntax error. Please only input integers between \`${minRandomNumber}\` and \`${maxRandomNumber}\`.`)
    })
})