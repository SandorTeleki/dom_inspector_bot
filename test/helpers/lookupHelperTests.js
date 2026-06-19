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

export function defineLookupHelperTests({
    name,
    modulePath,
    exportName,
    table,
    key,
    buttonPrefix,
    validId,
    invalidId,
    fuzzyQuery,
    alias,
    expectedFuzzyButtons = 1,
}) {
    let getHelper;

    beforeAll(async () => {
        await initHelperTestEnvironment();
        const helperModule = await import(modulePath);
        getHelper = helperModule[exportName];
    });

    afterAll(async () => {
        await teardownHelperTestEnvironment();
    });

    describe(`${name} helper`, () => {
        const entityLabel = table.slice(0, -1);
        const primaryMatch = makeEntity(validId, `Primary ${entityLabel}`, table);
        const secondaryMatch = makeEntity('99', `Secondary ${entityLabel}`, table);

        it('returns an embed for a valid ID lookup', async () => {
            mockJsonGet(`/${table}/${validId}`, { [key]: [primaryMatch] });

            const [embed, buttons, prefix, files] = await getHelper(validId, commandData);

            expect(embed.toJSON().title).toBeUndefined();
            expect(buttons).toEqual([]);
            expect(prefix).toBe(buttonPrefix);
            expect(files).toEqual([]);
        });

        it('looks up the leading ID when extra text follows the number', async () => {
            mockJsonGet(`/${table}/${validId}`, { [key]: [primaryMatch] });

            const [embed, buttons] = await getHelper(`${validId} extra words`, commandData);

            expect(embed.toJSON().title).toBeUndefined();
            expect(buttons).toEqual([]);
        });

        it('returns an error embed for an invalid ID', async () => {
            mockNotFound(`/${table}/${invalidId}`);

            const result = await getHelper(invalidId, commandData);
            expectErrorEmbed(result);
        });

        it('returns an error embed when fuzzy search finds no matches', async () => {
            mockFuzzyGet(table, {}, 404);

            const result = await getHelper('nonexistent query', commandData);
            expectErrorEmbed(result);
        });

        it('returns the best fuzzy match with alternate matches in the footer', async () => {
            mockFuzzyGet(table, { [key]: [primaryMatch, secondaryMatch] });

            const [embed, buttons, prefix] = await getHelper(fuzzyQuery, commandData);

            expect(embedFooter(embed)).toContain('Other matches [ID#]:');
            expect(embedFooter(embed)).toContain(`Secondary ${entityLabel} [99]`);
            expect(buttons.length).toBe(expectedFuzzyButtons);
            expect(prefix).toBe(buttonPrefix);
        });

        it('returns a single fuzzy match without alternate matches in the footer', async () => {
            mockFuzzyGet(table, { [key]: [primaryMatch] });

            const [embed, buttons] = await getHelper(fuzzyQuery, commandData);

            expect(embedFooter(embed)).toBeUndefined();
            expect(buttons).toEqual([]);
        });

        it('returns an error embed when fuzzy matches are too long to display', async () => {
            mockFuzzyGet(table, { [key]: createManyMatches(50, table) });

            const result = await getHelper('broad search term', commandData);
            expectTooManyMatchesEmbed(result);
        });

        it('resolves an alias before searching', async () => {
            mockFuzzyGet(table, { [key]: [primaryMatch, secondaryMatch] });

            const [embed] = await getHelper(alias, commandData);

            expect(embedFooter(embed)).toContain('Other matches [ID#]:');
        });
    });
}
