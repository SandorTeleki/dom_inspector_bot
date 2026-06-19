import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';
import { MockAgent, setGlobalDispatcher, getGlobalDispatcher } from 'undici';

const require = createRequire(import.meta.url);
const fetchScreenshotPath = require.resolve('../../utils/fetchScreenshot.js');
const sqlHelperPath = require.resolve('../../utils/sqlHelper.js');

const API_ORIGIN = 'http://localhost:8002';

let tmpDir;
let mockAgent;
let previousDispatcher;
let originalCwd;

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

function stubSqlHelper() {
    require.cache[sqlHelperPath] = {
        id: sqlHelperPath,
        filename: sqlHelperPath,
        loaded: true,
        exports: {
            sqlGetMentorNote: async () => undefined,
            sqlSelectNote: () => {},
            sqlInsertNote: () => {},
            sqlInsertLog: () => {},
            sqlInsertMentorLog: () => {},
            sqlUpdateNote: () => {},
            sqlBuildTables: () => {},
            sqlDropTables: () => {},
        },
    };
}

export function getMockAgent() {
    return mockAgent;
}

export async function initHelperTestEnvironment() {
    stubFetchScreenshot();
    stubSqlHelper();

    originalCwd = process.cwd();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dom-bot-test-'));
    process.chdir(tmpDir);

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
    if (originalCwd) {
        process.chdir(originalCwd);
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

export function mockFuzzyNotFound(table) {
    mockFuzzyGet(table, {}, 404);
}

export function mockNotFound(pathPattern) {
    mockJsonGet(pathPattern, {}, 404);
}
