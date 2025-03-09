/*
 * author : Syxles (Syxless) & Mizari (Mizari-Dev)
 */
const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    EmbedBuilder
} = require("discord.js");
const ticketConfig = require('../../configuration/tickets.json');

module.exports = {
    name: "ticket-review-select",
    type: "Select",
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async(client, interaction) => {
        const { reviewCache, console } = client;
        const { ticketId, values } = interaction;
        const value = values[0];
        try {
            if (value === '0') {
                await interaction.reply({ content: 'Pas de review, merci quand même !', ephemeral: true });

                const logsChannel = client.channels.cache.get(ticketConfig.logsChannel);
                if (logsChannel) {
                    const embed = new EmbedBuilder()
                        .setTitle(`Avis pour le ticket #${ticketId}`)
                        .setColor('#ffcc00')
                        .addFields(
                            { name: 'Utilisateur', value: `<@${interaction.user.id}>`, inline: true },
                            { name: 'Avis', value: 'Aucun avis laissé.', inline: false }
                        )
                        .setTimestamp();
                    await logsChannel.send({ embeds: [embed] });
                }
                return;
            }

            
            reviewCache.set(interaction.user.id, { 
                ticketId,
                rating: parseInt(value, 10) 
            });

            console.debug(`Cached review data for user ${interaction.user.id}:`, { 
                ticketId, 
                rating: parseInt(value, 10) 
            });

            const modal = new ModalBuilder()
                .setCustomId(`ticket-review-modal-${ticketId}`) 
                .setTitle(`Donnez votre avis (${value}/5)`);

            const commentInput = new TextInputBuilder()
                .setCustomId('reviewComment')
                .setLabel('Commentaire (facultatif)')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false);

            const row = new ActionRowBuilder().addComponents(commentInput);
            modal.addComponents(row);

            await interaction.showModal(modal);
        } catch (error) {
            console.error('Error handling review select:', error);
            await interaction.reply({ 
                content: 'Une erreur est survenue lors du traitement de votre sélection.', 
                ephemeral: true 
            }).catch(() => null);
        }
    }
}
