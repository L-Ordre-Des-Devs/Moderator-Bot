/**
 * author: Mizari (Mizari-Dev)
 */
const { ActionRowBuilder, ButtonBuilder, MessageFlags } = require("discord.js");

module.exports = {
    name: "post-relance-no",
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
        /* Demande si il a la solution */
        let cpnts = new ActionRowBuilder({
            components: [
                new ButtonBuilder({
                    customId: "post-solution-yes",
                    label: "Oui",
                    style: 3
                }),
                new ButtonBuilder({
                    customId: "post-solution-no",
                    label: "Non",
                    style: 4
                })
            ]
        });
        interaction.reply({ content: "Avez vous trouvé la solution ?", components: [cpnts] });
        let msg = interaction.message;
        cpnts = msg.components[0].components;
        cpnts = cpnts.map(cpnt => {
            return new ButtonBuilder({
                style: cpnt.data.style,
                label: cpnt.data.label,
                customId: cpnt.data.custom_id+"-disabled",
                disabled: true
            })
        });
        await msg.edit({ content: msg.content, components: [new ActionRowBuilder({ components: cpnts })] });
    }
}