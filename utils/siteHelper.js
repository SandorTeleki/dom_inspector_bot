const { EmbedBuilder } = require('discord.js');
const { request } = require('undici');
const { FUZZY_MATCH_URL, SITE_URL, BASE_URL } = require('./utils');
const { siteAliases } = require('./siteAliases');
const { similarMatches } =require('./similarMatches');

async function getSite( siteName ){
    if (siteName in siteAliases){ siteName = siteAliases[siteName] };
    var site;
    var similarMatchesString;
    if  (/^\d+$/.test(siteName)){
        const { body, statusCode } = await request(BASE_URL + SITE_URL + '/' + encodeURIComponent(siteName));
        if (statusCode === 404){
            const errorEmbed = new EmbedBuilder()
            .setTitle("Nothing found. Better luck next time!")
            .setImage('https://cdn.pixabay.com/photo/2017/03/09/12/31/error-2129569_960_720.jpg');
            return errorEmbed;
        }
        site  = await body.json();
    }

    else {
        const { body } = await request(BASE_URL + SITE_URL + FUZZY_MATCH_URL + encodeURIComponent(siteName));
        var { sites } = await body.json();
        site = sites[0];
        similarMatchesString = similarMatches(sites);
    }; 
    const siteEmbed = new EmbedBuilder()
        //.setTitle(site.name)
        //.setDescription('Mentor notes will go here.')
        .setImage(BASE_URL + site.screenshot);
    if ( similarMatchesString ) {siteEmbed.setFooter({text: similarMatchesString})};
    return siteEmbed;
}

module.exports = { getSite }