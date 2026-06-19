const { request } = require('undici');

async function readJsonBody(body) {
	const text = await body.text();

	try {
		return JSON.parse(text);
	} catch {
		return null;
	}
}

async function fetchApiJson(url) {
	const { statusCode, body } = await request(url);

	switch (statusCode) {
		case 404:
			return { ok: false, notFound: true };
		case 200: {
			const data = await readJsonBody(body);
			return data === null
				? { ok: false, parseError: true }
				: { ok: true, data };
		}
		default:
			return { ok: false, statusCode };
	}
}

function getEntityList(data, key) {
	const list = data?.[key];
	return Array.isArray(list) ? list : [];
}

function getFirstEntity(data, key) {
	return getEntityList(data, key)[0];
}

module.exports = { fetchApiJson, getEntityList, getFirstEntity };
