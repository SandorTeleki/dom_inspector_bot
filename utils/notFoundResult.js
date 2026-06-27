const fs = require('node:fs');
const path = require('node:path');
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { getRandomBooliAttachment } = require('./booliImage');

const NOT_FOUND_IMAGE_PATH = path.join(__dirname, '..', 'src', 'images', '404.jpg');
const NOT_FOUND_IMAGE_NAME = '404.jpg';
const API_CONNECTION_ERROR_TITLE = "Can't connect to the dom6api. Bug Toldi to check/fix it.";

function getNotFoundAttachment() {
	try {
		if (!fs.existsSync(NOT_FOUND_IMAGE_PATH)) {
			return null;
		}
	} catch {
		return null;
	}

	return new AttachmentBuilder(NOT_FOUND_IMAGE_PATH, { name: NOT_FOUND_IMAGE_NAME });
}

function notFoundEmbed(attachment) {
	const embed = new EmbedBuilder()
		.setTitle('Nothing found. Better luck next time!');

	if (attachment) {
		embed.setImage(`attachment://${attachment.name}`);
	}

	return embed;
}

function notFoundResult() {
	const attachment = getNotFoundAttachment();
	const files = attachment ? [attachment] : [];

	return [notFoundEmbed(attachment), [], '', files];
}

function apiErrorEmbed() {
	return new EmbedBuilder()
		.setTitle('Something went wrong. Try again later!');
}

function apiErrorResult() {
	return [apiErrorEmbed(), [], '', []];
}

function apiConnectionErrorEmbed(attachment) {
	const embed = new EmbedBuilder().setTitle(API_CONNECTION_ERROR_TITLE);

	if (attachment) {
		embed.setImage(`attachment://${attachment.name}`);
	}

	return embed;
}

function apiConnectionErrorResult() {
	const attachment = getRandomBooliAttachment();
	const files = attachment ? [attachment] : [];

	return [apiConnectionErrorEmbed(attachment), [], '', files];
}

function mercNotFoundResult() {
	const attachment = getNotFoundAttachment();
	const files = attachment ? [attachment] : [];

	return [notFoundEmbed(attachment), null, null, null, null, files, [], []];
}

function mercApiErrorResult() {
	return [apiErrorEmbed(), null, null, null, null, [], [], []];
}

function mercConnectionErrorResult() {
	const attachment = getRandomBooliAttachment();
	const files = attachment ? [attachment] : [];

	return [apiConnectionErrorEmbed(attachment), null, null, null, null, files, [], []];
}

function resolveLookupFailure(result, { merc = false } = {}) {
	if (result.connectionError) {
		return merc ? mercConnectionErrorResult() : apiConnectionErrorResult();
	}
	if (result.notFound) {
		return merc ? mercNotFoundResult() : notFoundResult();
	}
	if (!result.ok) {
		return merc ? mercApiErrorResult() : apiErrorResult();
	}
	return null;
}

function screenshotMissingEmbed() {
	return new EmbedBuilder()
		.setTitle("Screenshot missing from API. Ping Toldi please.");
}

function screenshotMissingResult() {
	return [screenshotMissingEmbed(), [], '', []];
}

function mercScreenshotMissingResult() {
	return [screenshotMissingEmbed(), null, null, null, null, [], [], []];
}

function isNotFound(statusCode) {
	return statusCode === 404;
}

module.exports = {
	notFoundEmbed,
	notFoundResult,
	apiErrorEmbed,
	apiErrorResult,
	apiConnectionErrorEmbed,
	apiConnectionErrorResult,
	mercNotFoundResult,
	mercApiErrorResult,
	mercConnectionErrorResult,
	resolveLookupFailure,
	screenshotMissingResult,
	mercScreenshotMissingResult,
	isNotFound,
	API_CONNECTION_ERROR_TITLE,
};
