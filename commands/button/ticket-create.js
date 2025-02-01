/*
 * author : Syxles (Syxless) & Mizari (Mizari-W)
 */
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
  name: "ticket-create",
  type: "Button",
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  run: async(client, interaction) => {
    const { ticketId } = interaction;

    const modal = new ModalBuilder()
      .setCustomId(`ticket-create-modal-${ticketId}`)
      .setTitle('Ouverture de ticket');
  
    const reasonInput = new TextInputBuilder()
      .setCustomId('ticketOpenReason')
      .setLabel('Expliquez brièvement votre demande')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const row = new ActionRowBuilder().addComponents(reasonInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
  }
}
