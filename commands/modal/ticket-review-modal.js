/*
 * author : Syxles (Syxless) & Mizari (Mizari-Dev)
 */
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require("discord.js");
const ticketConfig = require('../../configuration/tickets.json');

module.exports = {
  name: "ticket-review-modal",
  type: "Modal",
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  run: async(client, interaction) => {
    const { console, reviewCache, prisma } = client;
    const { ticketId } = interaction;
    try {
      await interaction.deferReply({ ephemeral: true });
      
      console.debug(`Modal submitted for ticket: ${ticketId}`);
  
      const userId = interaction.user.id;
      console.debug(`Looking for cached data for user: ${userId}`);
  
      const reviewData = reviewCache.get(userId);
      console.debug(`Cached data found:`, reviewData);
  
      if (!reviewData || reviewData.ticketId !== ticketId) {
        console.debug(`Cache mismatch! Expected: ${ticketId}, Found: ${reviewData?.ticketId}`);
        return interaction.editReply({ content: "Erreur : La note n'a pas été trouvée.", ephemeral: true });
      }
  
      const { rating } = reviewData;
      reviewCache.delete(userId);
  
      const comment = interaction.fields?.getTextInputValue('reviewComment') || null;
  
      await prisma.review.create({
        data: {
          ticketId: ticketId,
          userId: userId,
          rating: rating,
          comment: comment
        }
      });
  
      await interaction.editReply({ 
        content: 'Merci pour votre avis ! ✅', 
        ephemeral: true 
      });
  
      const logsChannel = client.channels.cache.get(ticketConfig.logsChannel);
      if (logsChannel) {
        const embed = new EmbedBuilder()
          .setTitle(`📝 Avis reçu pour le ticket #${ticketId}`)
          .setColor('#4CAF50')
          .addFields(
            { name: 'Utilisateur', value: `<@${userId}>`, inline: true },
            { name: 'Note', value: `${rating}/5`, inline: true },
            { name: 'Commentaire', value: comment || 'Aucun commentaire', inline: false }
          )
          .setTimestamp();
        
        await logsChannel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Error handling review modal:', error);
      await interaction.editReply({ 
        content: 'Une erreur est survenue lors de l\'enregistrement de votre avis.', 
        ephemeral: true 
      }).catch(() => null);
    }
  }
}
