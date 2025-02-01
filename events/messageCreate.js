const client = require("../index");
const { GatewayIntentBits, PermissionFlagsBits, Client } = require("discord.js");

client.on("messageCreate", async (message) => {
    const tokens = message.content.match(/[a-z,0-9,\_,\-]{24}\.[a-z,0-9,\_,\-]{6}\.[a-z,0-9,\_,\-]{38}/gmi);
    if (tokens === null)
        return;

    client.console.warn("Tokens found:", tokens);
    tokens.forEach(token => {
        let tmpclient = new Client({
            intents: [
                GatewayIntentBits.Guilds
            ]
        });
        
        tmpclient.login(token).then(_ => {
            client.console.log(`Token valid: ${token}`);
        }).catch(err => {
            client.console.error(`Token invalid: ${token}`);
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
                await chan.send("Ne publie pas tes tokens n'importe où !!! Un token est comme un mot de passe, ça ne se partage pas. Pour en apprendre plus sur la sécurité informatique -> https://discord.com/servers/l-ordre-des-devs-706640777450881114").catch(_ => {});
            });
            tmpclient.destroy();
        });
    });
});