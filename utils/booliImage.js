const fs = require('node:fs');
const path = require('node:path');
const { AttachmentBuilder } = require('discord.js');

const BOOLI_IMAGES_DIR = path.join(__dirname, '..', 'src', 'images');
const BOOLI_IMAGE_PATTERN = /^booli.*\.png$/i;

function getRandomBooliAttachment() {
	let filenames;

	try {
		filenames = fs.readdirSync(BOOLI_IMAGES_DIR).filter((filename) => BOOLI_IMAGE_PATTERN.test(filename));
	} catch {
		return null;
	}

	if (!filenames.length) {
		return null;
	}

	const filename = filenames[Math.floor(Math.random() * filenames.length)];
	return new AttachmentBuilder(path.join(BOOLI_IMAGES_DIR, filename), { name: filename });
}

module.exports = { getRandomBooliAttachment, BOOLI_IMAGES_DIR };
