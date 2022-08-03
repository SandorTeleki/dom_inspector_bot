const { MessageEmbed } = require('discord.js');
const { request } = require('undici');
const { SITE_URL, BASE_URL } = require('./utils');
const { similarMatches } =require('./similarMatches');


async function getSite( siteName ){
    const { body } = await request(SITE_URL + encodeURIComponent(siteName));
    const { sites } = await body.json();

    const [siteAnswer] = sites;
    const siteEmbed = new MessageEmbed()
        .setTitle(siteAnswer.name)
        //.setDescription('Mentor notes will go here.')
        .setImage(BASE_URL + siteAnswer.screenshot)
        .setFooter({text:`Other matches:\n${similarMatches(sites)}`})
    return siteEmbed;
}

module.exports = { getSite }