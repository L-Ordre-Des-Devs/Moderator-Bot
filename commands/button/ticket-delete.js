/*
 * author : Syxles (Syxless) & Mizari (Mizari-Dev)
 */
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
    name: "ticket-delete",
    type: "Button",
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async(client, interaction) => {
        const { console, prisma } = client;
        try {
            const { ticketId } = interaction;
            await interaction.deferReply({ ephemeral: true });

            const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });

            if (!ticket) {
                await interaction.followUp({ content: 'Ticket introuvable.', ephemeral: true });
                return;
            }

            await interaction.followUp({ 
                content: `Ticket #${ticket.id} supprimé définitivement.`, 
                ephemeral: true 
            });

            const channel = interaction.guild.channels.cache.get(ticket.channelId);
            if (channel) {
                await channel.delete().catch(() => null);
            }

            await prisma.ticket.delete({ where: { id: ticketId } });
        
        } catch (error) {
            console.error('Erreur lors de la suppression du ticket:', error);
            await interaction.followUp({ 
                content: 'Une erreur est survenue lors de la suppression.', 
                ephemeral: true 
            }).catch(() => null);
        }
    }
}
