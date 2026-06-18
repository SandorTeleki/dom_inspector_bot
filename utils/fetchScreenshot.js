const { AttachmentBuilder } = require('discord.js');
const { request } = require('undici');
const { BASE_URL } = require('./utils');

async function fetchScreenshot(screenshotPath, filename = 'screenshot.png') {
    try {
        const { statusCode, body } = await request(BASE_URL + screenshotPath);
        if (statusCode !== 200) {
            return null;
        }
        const chunks = [];
        for await (const chunk of body) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        return new AttachmentBuilder(buffer, { name: filename });
    } catch (err) {
        console.error(`Failed to fetch screenshot from ${screenshotPath}:`, err.message);
        return null;
    }
}

module.exports = { fetchScreenshot };
