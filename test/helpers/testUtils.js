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

export function expectTooManyMatchesEmbed(result) {
    const [embed, buttons, buttonPrefix, files] = result;
    expect(embedTitle(embed)).toBe('Too many matches to display. Try narrowing your search!');
    expect(buttons).toEqual([]);
    expect(buttonPrefix).toBe('');
    expect(files).toEqual([]);
}
