/*
 * author : Syxles (Syxless) & Mizari (Mizari-W)
 */
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
  name: "ticket-close",
  type: "Button",
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  run: async(client, interaction) => {
    const { ticketId } = interaction;

    const modal = new ModalBuilder()
        .setCustomId(`ticket-close-modal-${ticketId}`)
        .setTitle('Raison de fermeture du ticket');

    const reasonInput = new TextInputBuilder()
        .setCustomId('ticketCloseReason')
        .setLabel('Raison')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

    const row = new ActionRowBuilder().addComponents(reasonInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
  }
}
