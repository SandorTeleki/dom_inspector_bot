const { EmbedBuilder } = require('discord.js');
const { getRandomBooliAttachment } = require('./booliImage');

const NOT_FOUND_IMAGE = 'https://cdn.pixabay.com/photo/2017/03/09/12/31/error-2129569_960_720.jpg';
const API_CONNECTION_ERROR_TITLE = "Can't connect to the dom6api. Bug Toldi to check/fix it.";

function notFoundEmbed() {
	return new EmbedBuilder()
		.setTitle('Nothing found. Better luck next time!')
		.setImage(NOT_FOUND_IMAGE);
}

function notFoundResult() {
	return [notFoundEmbed(), [], '', []];
}

function apiErrorEmbed() {
	return new EmbedBuilder()
		.setTitle('Something went wrong. Try again later!')
		.setImage(NOT_FOUND_IMAGE);
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
	return [notFoundEmbed(), null, null, null, null, [], [], []];
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
	isNotFound,
	API_CONNECTION_ERROR_TITLE,
};
