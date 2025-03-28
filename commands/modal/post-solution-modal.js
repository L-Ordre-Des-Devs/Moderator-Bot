/**
 * author: Mizari (Mizari-Dev)
 */
const { ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { tags } = require("../../configuration/posts_manager.json");

module.exports = {
    name: "solution",
    type: "Modal",
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        const { console } = client;
        /* Send solution */
        const solution = interaction.fields.fields.get("details").value;
        let msg = await interaction.reply({ content: "**Solution :**\n"+solution, withResponse: true });
        msg = msg.resource.message;
        /* Pin Solution */
        await msg.pin();
        /* Disable buttons */
        msg = interaction.message;
        let cpnts = msg.components[0].components;
        cpnts = cpnts.map(cpnt => {
            return new ButtonBuilder({
                style: cpnt.data.style,
                label: cpnt.data.label,
                customId: cpnt.data.custom_id+"-disabled",
                disabled: true
            })
        });
        await msg.edit({
            content: msg.content,
            components: [new ActionRowBuilder({ components: cpnts })]
        }).catch(e => console.error("Pas pu désactiver les boutons :", e));
        /* Mettre le tag */
        await interaction.channel.setAppliedTags([tags[interaction.channel.parentId]]).catch(e => console.error("Pas pu appliquer le tag :", e));
        /* Lock le poste */
        await interaction.channel.setLocked(true).catch(e => console.error("Pas pu lock le poste :", e));
        /* Close le poste */
        await interaction.channel.setArchived(true).catch(e => console.error("Pas pu archiver le poste :", e));
    }
}