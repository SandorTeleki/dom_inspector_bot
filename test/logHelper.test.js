import { createRequire } from 'module';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

const require = createRequire(import.meta.url);
const sqlHelperPath = require.resolve('../utils/sqlHelper.js');
const logHelperPath = require.resolve('../utils/logHelper.js');

describe('logHelper', () => {
	const sqlInsertLog = vi.fn();
	let createLog;

	beforeAll(() => {
		require.cache[sqlHelperPath] = {
			id: sqlHelperPath,
			filename: sqlHelperPath,
			loaded: true,
			exports: { sqlInsertLog },
		};
		delete require.cache[logHelperPath];
		({ createLog } = require('../utils/logHelper.js'));
	});

	beforeEach(() => {
		sqlInsertLog.mockClear();
	});

	it('logs slash command interactions to SQL', () => {
		const interaction = {
			isChatInputCommand: () => true,
			toString: () => '/item frost brand',
			guild: { name: 'Test Guild', id: 'guild-1' },
			channel: { name: 'general', id: 'channel-1' },
			user: { tag: 'user#0001', id: 'user-1' },
			createdTimestamp: 1234567890,
		};

		createLog(interaction);

		expect(sqlInsertLog).toHaveBeenCalledWith(
			'Test Guild',
			'guild-1',
			'general',
			'channel-1',
			'user#0001',
			'user-1',
			'/item frost brand',
			1234567890,
		);
	});

	it('logs button interactions using the custom id', () => {
		const interaction = {
			isChatInputCommand: () => false,
			customId: 'item-42',
			guild: { name: 'Test Guild', id: 'guild-1' },
			channel: { name: 'general', id: 'channel-1' },
			user: { tag: 'user#0001', id: 'user-1' },
			createdTimestamp: 1234567890,
		};

		createLog(interaction);

		expect(sqlInsertLog).toHaveBeenCalledWith(
			'Test Guild',
			'guild-1',
			'general',
			'channel-1',
			'user#0001',
			'user-1',
			'item-42',
			1234567890,
		);
	});
});
