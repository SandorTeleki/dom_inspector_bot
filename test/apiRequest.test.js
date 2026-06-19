import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
	initHelperTestEnvironment,
	teardownHelperTestEnvironment,
	mockJsonGet,
} from './helpers/httpTestEnvironment.js';

let fetchApiJson;
let getEntityList;
let getFirstEntity;

beforeAll(async () => {
	await initHelperTestEnvironment();
	({ fetchApiJson, getEntityList, getFirstEntity } = await import('../utils/apiRequest.js'));
});

afterAll(async () => {
	await teardownHelperTestEnvironment();
});

describe('apiRequest', () => {
	it('returns notFound for HTTP 404 responses', async () => {
		mockJsonGet('/items?match=fuzzy&name=missing', {}, 404);

		const result = await fetchApiJson('http://localhost:8002/items?match=fuzzy&name=missing');

		expect(result).toEqual({ ok: false, notFound: true });
	});

	it('returns notFound when a 404 body is plain text', async () => {
		mockJsonGet('/items/99999', 'no matches found', 404);

		const result = await fetchApiJson('http://localhost:8002/items/99999');

		expect(result).toEqual({ ok: false, notFound: true });
	});

	it('returns parseError when a 200 response is not valid JSON', async () => {
		mockJsonGet('/items/99999', 'no matches found', 200);

		const result = await fetchApiJson('http://localhost:8002/items/99999');

		expect(result).toEqual({ ok: false, parseError: true });
	});

	it('returns the status code for other non-200 responses', async () => {
		mockJsonGet('/items/99999', { error: 'bad request' }, 400);

		const result = await fetchApiJson('http://localhost:8002/items/99999');

		expect(result).toEqual({ ok: false, statusCode: 400 });
	});

	it('returns parsed JSON for successful responses', async () => {
		mockJsonGet('/items/1', { items: [{ id: '1', name: 'Test Item' }] });

		const result = await fetchApiJson('http://localhost:8002/items/1');

		expect(result.ok).toBe(true);
		expect(getFirstEntity(result.data, 'items')).toEqual({ id: '1', name: 'Test Item' });
		expect(getEntityList(result.data, 'items')).toHaveLength(1);
	});
});
