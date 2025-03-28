/**
 * author: Mizari (Mizari-Dev)
 */
const client = require("../index");
const { console } = client;
const {
   ActivityType,
   EmbedBuilder,
   ActionRowBuilder,
   ButtonBuilder,
   ButtonStyle
} = require("discord.js");
const ticketConfig = require('../configuration/tickets.json');

client.on("ready", async () => {
    Init();

    TicketInit();
});

/**
 * Init
 */
function Init() {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity(`May the </> be with you!`, {type: ActivityType.Custom});
}

/**
 * Init for tickets
 * @returns {void} void
 */
async function TicketInit() {
    console.log("Init ticket system");
    try {
        const channel = client.channels.cache.get(ticketConfig.ticketPanelChannel);
        if (!channel) return console.error("No channel found");

        // Vérifier si un panel existe déjà
        const messages = await channel.messages.fetch({ limit: 10 });
        const existingPanel = messages.find(m => 
            m.embeds[0]?.title === ticketConfig.panelConfig.title
        );

        if (!existingPanel){
            // Créer le nouveau panel
            const embed = new EmbedBuilder()
                .setTitle(ticketConfig.panelConfig.title)
                .setDescription(ticketConfig.panelConfig.description)
                .setColor(ticketConfig.panelConfig.color)
                .setImage(ticketConfig.panelConfig.banner)
                .setThumbnail(ticketConfig.panelConfig.thumbnail);
    
            const row = new ActionRowBuilder().addComponents(
                ...Object.entries(ticketConfig.templates).map(([key, tpl]) => (
                    new ButtonBuilder()
                        .setCustomId(`ticket-create-${key}`)
                        .setLabel(tpl.name)
                        .setEmoji(tpl.emoji)
                        .setStyle(ButtonStyle[tpl.buttonStyle])
                ))
            );

            await channel.send({ embeds: [embed], components: [row] });
        }

    } catch (error) {
        client.console.error('Erreur initialisation panel tickets:', error);
    }

    try {
        const tickets = await client.prisma.ticket.findMany({
            where: {
                OR: [
                    { status: 'open' },
                    { status: 'claimed' }
                ]
            }
        });
        client.console.info(`Loaded ${tickets.length} active tickets from DB.`);
    } catch (err) {
        client.console.error('Error loading tickets:', err);
    }
}