import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { MockAgent, setGlobalDispatcher, getGlobalDispatcher } from 'undici';

const require = createRequire(import.meta.url);
const fetchScreenshotPath = require.resolve('../../utils/fetchScreenshot.js');

const API_ORIGIN = 'http://localhost:8002';

let tmpDir;
let mockAgent;
let previousDispatcher;

function stubFetchScreenshot() {
    require.cache[fetchScreenshotPath] = {
        id: fetchScreenshotPath,
        filename: fetchScreenshotPath,
        loaded: true,
        exports: {
            fetchScreenshot: async () => null,
        },
    };
}

export function getMockAgent() {
    return mockAgent;
}

export async function initHelperTestEnvironment() {
    stubFetchScreenshot();

    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dom-bot-test-'));
    process.chdir(tmpDir);

    await new Promise((resolve, reject) => {
        const db = new sqlite3.Database('./logs.db');
        db.exec(
            `CREATE TABLE IF NOT EXISTS mentor_notes (
                class TEXT,
                class_id INTEGER,
                name TEXT,
                note TEXT,
                guild_name TEXT,
                guild_id INTEGER,
                written_time INTEGER,
                written_by_user TEXT
            )`,
            (err) => {
                db.close((closeErr) => {
                    if (err || closeErr) {
                        reject(err || closeErr);
                    } else {
                        resolve();
                    }
                });
            }
        );
    });

    previousDispatcher = getGlobalDispatcher();
    mockAgent = new MockAgent();
    mockAgent.disableNetConnect();
    setGlobalDispatcher(mockAgent);
}

export async function teardownHelperTestEnvironment() {
    if (previousDispatcher) {
        setGlobalDispatcher(previousDispatcher);
    }
    if (mockAgent) {
        await mockAgent.close();
    }
    if (tmpDir) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
}

export function mockJsonGet(pathPattern, body, statusCode = 200) {
    getMockAgent()
        .get(API_ORIGIN)
        .intercept({
            path: pathPattern,
            method: 'GET',
        })
        .reply(statusCode, body);
}

export function mockFuzzyGet(table, body, statusCode = 200) {
    mockJsonGet(new RegExp(`^/${table}\\?match=fuzzy&name=.+$`), body, statusCode);
}

export function mockNotFound(pathPattern) {
    mockJsonGet(pathPattern, {}, 404);
}
