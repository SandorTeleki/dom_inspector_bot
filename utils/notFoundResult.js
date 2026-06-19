const { EmbedBuilder } = require('discord.js');

const NOT_FOUND_IMAGE = 'https://cdn.pixabay.com/photo/2017/03/09/12/31/error-2129569_960_720.jpg';

function notFoundEmbed() {
	return new EmbedBuilder()
		.setTitle('Nothing found. Better luck next time!')
		.setImage(NOT_FOUND_IMAGE);
}

function notFoundResult() {
	return [notFoundEmbed(), [], '', []];
}

function isNotFound(statusCode) {
	return statusCode === 404;
}

module.exports = { notFoundEmbed, notFoundResult, isNotFound };
