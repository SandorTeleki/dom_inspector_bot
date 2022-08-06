const { MessageEmbed } = require('discord.js');
const { request } = require('undici');
const { FUZZY_MATCH_URL, SITE_URL, BASE_URL } = require('./utils');
const { siteAliases } = require('./siteAliases');
const { similarMatches } =require('./similarMatches');

async function getSite( siteName ){
    if (siteName in siteAliases){ siteName = siteAliases[siteName] };
    var site;
    var similarMatchesString;
    if  (/^\d+$/.test(siteName)){
        const { body } = await request(BASE_URL + SITE_URL + '/' + encodeURIComponent(siteName));
        site  = await body.json();
    }

    else {
        const { body } = await request(BASE_URL + SITE_URL + FUZZY_MATCH_URL + encodeURIComponent(siteName));
        var { sites } = await body.json();
        site = sites[0];
        similarMatchesString = similarMatches(sites);
    }; 
    const siteEmbed = new MessageEmbed()
        //.setTitle(site.name)
        //.setDescription('Mentor notes will go here.')
        .setImage(BASE_URL + site.screenshot);
    if ( similarMatchesString ) {siteEmbed.setFooter({text: similarMatchesString})};
    return siteEmbed;
}

module.exports = { getSite }