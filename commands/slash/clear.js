/*
 * author : Mizari (Mizari-Dev)
 */
const { ApplicationCommandType, ApplicationCommandOptionType, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "clear",
  description: "Delete some messages.",
  descriptionLocalizations: {fr: "Supprime plusieurs messages."},
  options: [
    {
      name: "number",
      description: "The number of messages you want to delete.",
      descriptionLocalizations: {fr: "Le nombre de message que vous voulez supprimer."},
      type: ApplicationCommandOptionType.Integer,
      required: true,
      max_value: 50
    }
  ],
  type: ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionsBitField.Flags.ManageMessages,
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {String[]} args
   */
  run: async(client, interaction, args) => {
    await interaction.deferReply({ ephemeral: false }).catch(() => {});
    const num = args[0]+1;
    interaction.channel.bulkDelete(num, true);
  }
}
