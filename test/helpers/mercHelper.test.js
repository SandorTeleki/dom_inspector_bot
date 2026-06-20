import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
    initHelperTestEnvironment,
    teardownHelperTestEnvironment,
    mockJsonGet,
    mockFuzzyGet,
    mockNotFound,
    mockConnectionError,
} from './httpTestEnvironment.js';
import {
    commandData,
    makeEntity,
    embedFooter,
    expectMercNotFoundResult,
    expectMercConnectionErrorResult,
    expectMercTooManyMatchesResult,
    expectTooManyMatchesEmbed,
    createManyMatches,
} from './testUtils.js';

let getMerc;

beforeAll(async () => {
    await initHelperTestEnvironment();
    ({ getMerc } = await import('../../utils/helpers/mercHelper.js'));
});

afterAll(async () => {
    await teardownHelperTestEnvironment();
});

describe('merc helper', () => {
    const table = 'mercs';
    const key = 'mercs';
    const validId = '5';
    const primaryMatch = {
        ...makeEntity(validId, 'Elephant Corps', table),
        bossname: 'Hannibal',
        com: '501',
        unit: '502',
        nrunits: '12',
    };
    const secondaryMatch = {
        ...makeEntity('6', 'Horse Archers', table),
        bossname: 'Attila',
        com: '601',
        unit: '602',
        nrunits: '20',
    };

    it('returns embeds for a valid ID lookup', async () => {
        mockJsonGet(`/${table}/${validId}`, { [key]: [primaryMatch] });

        const result = await getMerc(validId, commandData);
        const [mercEmbed, mercLeaderEmbed, mercTroopEmbed, mercLeaderButton, mercUnitButton, mercFiles] = result;

        expect(mercLeaderEmbed.toJSON().fields?.[0]?.value).toBe('Hannibal');
        expect(mercTroopEmbed.toJSON().fields?.[0]?.value).toBe('12');
        expect(mercLeaderButton.data.custom_id).toBe('merc-leader');
        expect(mercUnitButton.data.custom_id).toBe('merc-unit');
        expect(mercFiles).toEqual([]);
    });

    it('looks up the leading ID when extra text follows the number', async () => {
        mockJsonGet(`/${table}/${validId}`, { [key]: [primaryMatch] });

        const [mercEmbed, mercLeaderEmbed] = await getMerc(`${validId} extra words`, commandData);

        expect(mercLeaderEmbed.toJSON().fields?.[0]?.value).toBe('Hannibal');
        expect(embedFooter(mercEmbed)).toBeUndefined();
    });

    it('returns an error embed for an invalid ID', async () => {
        mockNotFound(`/${table}/99999`);

        const result = await getMerc('99999', commandData);
        expectMercNotFoundResult(result);
    });

    it('returns a connection error embed when the API is unreachable', async () => {
        mockConnectionError(`/${table}/${validId}`);

        const result = await getMerc(validId, commandData);
        expectMercConnectionErrorResult(result);
    });

    it('returns an error embed when fuzzy search finds no matches', async () => {
        mockFuzzyGet(table, {}, 404);

        const result = await getMerc('nonexistent query', commandData);
        expectMercNotFoundResult(result);
    });

    it('returns the best fuzzy match with alternate matches in the footer', async () => {
        mockFuzzyGet(table, { [key]: [primaryMatch, secondaryMatch] });

        const [mercEmbed] = await getMerc('elephant corps', commandData);

        expect(embedFooter(mercEmbed)).toContain('Other matches [ID#]:');
        expect(embedFooter(mercEmbed)).toContain('Horse Archers [6]');
    });

    it('returns a single fuzzy match without alternate matches in the footer', async () => {
        mockFuzzyGet(table, { [key]: [primaryMatch] });

        const [mercEmbed] = await getMerc('elephant corps', commandData);

        expect(embedFooter(mercEmbed)).toBeUndefined();
    });

    it('resolves a numeric alias to an ID lookup', async () => {
        const numericAliasId = '63';
        const goteMerc = {
            ...makeEntity(numericAliasId, 'Gote Mercenary Band', table),
            bossname: 'Gote Leader',
            com: '631',
            unit: '632',
            nrunits: '8',
        };

        mockJsonGet(`/${table}/${numericAliasId}`, { [key]: [goteMerc] });

        const [mercEmbed, mercLeaderEmbed] = await getMerc('gote', commandData);

        expect(mercLeaderEmbed.toJSON().fields?.[0]?.value).toBe('Gote Leader');
        expect(embedFooter(mercEmbed)).toBeUndefined();
    });

    it('returns an error embed when fuzzy matches are too long to display', async () => {
        const manyMatches = createManyMatches(50, table).map((match, index) => ({
            ...match,
            bossname: `Leader ${index + 1}`,
            com: String(700 + index),
            unit: String(800 + index),
            nrunits: '10',
        }));
        mockFuzzyGet(table, { [key]: manyMatches });

        const result = await getMerc('broad search term', commandData);
        expectMercTooManyMatchesResult(result);
    });

    it('resolves an alias before searching', async () => {
        mockFuzzyGet(table, { [key]: [primaryMatch, secondaryMatch] });

        const [mercEmbed] = await getMerc('hannibal', commandData);

        expect(embedFooter(mercEmbed)).toContain('Other matches [ID#]:');
    });
});
