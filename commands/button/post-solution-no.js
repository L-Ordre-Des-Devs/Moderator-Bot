/**
 * author: Mizari (Mizari-Dev)
 */
const { MessageFlags } = require("discord.js");

module.exports = {
    name: "post-solution-no",
    type: "Button",
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        if (interaction.channel.ownerId !== interaction.user.id)
            return interaction.reply({ content: {
                "fr": "Vous n'êtes pas l'owner de ce poste."
            }[interaction.locale] || "You are not the owner of this post.", flags: MessageFlags.Ephemeral });
        interaction.channel.delete();
    }

}