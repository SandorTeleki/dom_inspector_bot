import { expect } from 'vitest';

export const commandData = {
    type: 2,
    channel: { id: '000000000000000000' },
    guild: { id: 'test-guild-id' },
};

export function makeEntity(id, name, table) {
    return {
        id: String(id),
        name,
        image: `/${table}/${id}/screenshot`,
    };
}

export function createManyMatches(count, table) {
    return Array.from({ length: count }, (_, i) =>
        makeEntity(i + 1, `Match Number ${i + 1} With Extra Long Name For Testing`, table)
    );
}

export function embedTitle(embed) {
    return embed.toJSON().title;
}

export function embedFooter(embed) {
    return embed.toJSON().footer?.text;
}

export function expectErrorEmbed(result) {
    const [embed, buttons, buttonPrefix, files] = result;
    expect(embedTitle(embed)).toBe('Nothing found. Better luck next time!');
    expect(buttons).toEqual([]);
    expect(buttonPrefix).toBe('');
    expect(files).toEqual([]);
}

export function expectConnectionErrorEmbed(result) {
    const [embed, buttons, buttonPrefix, files] = result;
    expect(embedTitle(embed)).toBe("Can't connect to the dom6api. Bug Toldi to check/fix it.");
    expect(buttons).toEqual([]);
    expect(buttonPrefix).toBe('');
    expect(Array.isArray(files)).toBe(true);
}

export function expectMercConnectionErrorResult(result) {
    const [mercEmbed, mercLeaderEmbed, mercTroopEmbed, mercLeaderButton, mercUnitButton, mercFiles, leaderFiles, troopFiles] = result;
    expect(embedTitle(mercEmbed)).toBe("Can't connect to the dom6api. Bug Toldi to check/fix it.");
    expect(mercLeaderEmbed).toBeNull();
    expect(mercTroopEmbed).toBeNull();
    expect(mercLeaderButton).toBeNull();
    expect(mercUnitButton).toBeNull();
    expect(Array.isArray(mercFiles)).toBe(true);
    expect(leaderFiles).toEqual([]);
    expect(troopFiles).toEqual([]);
}

export function expectTooManyMatchesEmbed(result) {
    const [embed, buttons, buttonPrefix, files] = result;
    expect(embedTitle(embed)).toBe('Too many matches to display. Try narrowing your search!');
    expect(buttons).toEqual([]);
    expect(buttonPrefix).toBe('');
    expect(files).toEqual([]);
}

export function expectMercNotFoundResult(result) {
    const [mercEmbed, mercLeaderEmbed, mercTroopEmbed, mercLeaderButton, mercUnitButton, mercFiles, leaderFiles, troopFiles] = result;
    expect(embedTitle(mercEmbed)).toBe('Nothing found. Better luck next time!');
    expect(mercLeaderEmbed).toBeNull();
    expect(mercTroopEmbed).toBeNull();
    expect(mercLeaderButton).toBeNull();
    expect(mercUnitButton).toBeNull();
    expect(mercFiles).toEqual([]);
    expect(leaderFiles).toEqual([]);
    expect(troopFiles).toEqual([]);
}

export function expectMercTooManyMatchesResult(result) {
    const [mercEmbed, mercLeaderEmbed, mercTroopEmbed, mercLeaderButton, mercUnitButton, mercFiles, leaderFiles, troopFiles] = result;
    expect(embedTitle(mercEmbed)).toBe('Too many matches to display. Try narrowing your search!');
    expect(mercLeaderEmbed).toBeNull();
    expect(mercTroopEmbed).toBeNull();
    expect(mercLeaderButton).toBeNull();
    expect(mercUnitButton).toBeNull();
    expect(mercFiles).toEqual([]);
    expect(leaderFiles).toEqual([]);
    expect(troopFiles).toEqual([]);
}
