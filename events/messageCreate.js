const client = require("../index");
const { GatewayIntentBits, PermissionFlagsBits, Client } = require("discord.js");
const { console, prisma } = client;

client.on("messageCreate", async (message) => {

    // Token in message manager
    const tokens = message.content.match(/[a-z,0-9,\_,\-]{24}\.[a-z,0-9,\_,\-]{6}\.[a-z,0-9,\_,\-]{38}/gmi);
    if (tokens !== null) {
        TokenDetector();
    }

    // Tickets manager
    if (message.channel?.name?.startsWith('ticket-')) {
        TicketManager();
    }

});

/**
 * Detect tokens in messages
 */
function TokenDetector() {
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
 * Check for activity in tickets
 */
async function TicketManager() {
    const channelId = message.channel.id;
    const ticket = await prisma.ticket.findUnique({
        where: { channelId }
    });

    if (ticket) {
        await prisma.ticket.update({
            where: { id: ticket.id },
            data: { lastActivity: new Date() }
        });
    }
}