import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
    initHelperTestEnvironment,
    teardownHelperTestEnvironment,
    mockJsonGet,
    mockFuzzyGet,
    mockNotFound,
} from './httpTestEnvironment.js';
import {
    commandData,
    makeEntity,
    embedFooter,
    expectErrorEmbed,
    expectTooManyMatchesEmbed,
    createManyMatches,
} from './testUtils.js';

let getUnit;

beforeAll(async () => {
    await initHelperTestEnvironment();
    ({ getUnit } = await import('../../utils/helpers/unitHelper.js'));
});

afterAll(async () => {
    await teardownHelperTestEnvironment();
});

describe('unit helper', () => {
    const table = 'units';
    const key = 'units';
    const validId = '101';
    const primaryMatch = makeEntity(validId, 'Anakite', table);
    const secondaryMatch = makeEntity('102', 'Anakite Commander', table);

    it('returns an embed for a valid ID lookup', async () => {
        mockJsonGet(`/${table}/${validId}`, { [key]: [primaryMatch] });

        const [embed, buttons, prefix, files] = await getUnit(validId, commandData);

        expect(embed.toJSON().title).toBeUndefined();
        expect(buttons).toEqual([]);
        expect(prefix).toBe('unit-');
        expect(files).toEqual([]);
    });

    it('looks up the leading ID when extra text follows the number', async () => {
        mockJsonGet(`/${table}/${validId}`, { [key]: [primaryMatch] });

        const [embed, buttons] = await getUnit(`${validId} extra words`, commandData);

        expect(embed.toJSON().title).toBeUndefined();
        expect(buttons).toEqual([]);
    });

    it('returns an error embed for an invalid ID', async () => {
        mockNotFound(`/${table}/99999`);

        const result = await getUnit('99999', commandData);
        expectErrorEmbed(result);
    });

    it('returns the best fuzzy match with alternate matches in the footer', async () => {
        mockFuzzyGet(table, { [key]: [primaryMatch, secondaryMatch] });

        const [embed, buttons, prefix] = await getUnit('anakite', commandData);

        expect(embedFooter(embed)).toContain('Other matches [ID#]:');
        expect(embedFooter(embed)).toContain('Anakite Commander [102]');
        expect(buttons.length).toBe(1);
        expect(prefix).toBe('unit-');
    });

    it('returns a single fuzzy match without alternate matches in the footer', async () => {
        mockFuzzyGet(table, { [key]: [primaryMatch] });

        const [embed, buttons] = await getUnit('anakite', commandData);

        expect(embedFooter(embed)).toBeUndefined();
        expect(buttons).toEqual([]);
    });

    it('picks the unit matching the requested size and lists the rest as alternates', async () => {
        const sizeTwo = { ...makeEntity('201', 'Anakite', table), size: '2' };
        const sizeThree = { ...makeEntity('202', 'Anakite', table), size: '3' };
        const sizeThreeCommander = { ...makeEntity('203', 'Anakite Commander', table), size: '3' };

        mockFuzzyGet(table, { [key]: [sizeTwo, sizeThree, sizeThreeCommander] });

        const [embed, buttons] = await getUnit('anakite 3', commandData);

        expect(embedFooter(embed)).toContain('Other matches [ID#]:');
        expect(embedFooter(embed)).toContain('Anakite [201]');
        expect(embedFooter(embed)).toContain('Anakite Commander [203]');
        expect(embedFooter(embed)).not.toContain('Anakite [202]');
        expect(buttons.length).toBe(2);
        expect(buttons[0].data.custom_id).toBe('unit-201');
    });

    it('returns an error embed when fuzzy matches are too long to display', async () => {
        mockFuzzyGet(table, { [key]: createManyMatches(50, table) });

        const result = await getUnit('broad search term', commandData);
        expectTooManyMatchesEmbed(result);
    });

    it('resolves an alias before searching', async () => {
        mockFuzzyGet(table, { [key]: [primaryMatch, secondaryMatch] });

        const [embed] = await getUnit('chad', commandData);

        expect(embedFooter(embed)).toContain('Other matches [ID#]:');
    });
});
