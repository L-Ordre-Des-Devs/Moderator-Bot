/**
 * author: Mizari (Mizari-Dev)
 */
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, MessageFlags } = require("discord.js");

module.exports = {
    name: "post-solution-yes",
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
        
        let modal = new ModalBuilder({
            title: "Solution",
            customId: "solution",
            components: [
                new ActionRowBuilder({
                    components: [
                        new TextInputBuilder({
                            label: "Détails",
                            customId: "details",
                            placeholder: "Expliquez la solution à votre problème",
                            style: TextInputStyle.Paragraph,
                            required: true
                        })
                    ]
                })
            ]
        });
        interaction.showModal(modal);
    }
}