/**
 * author: Mizari (Mizari-Dev)
 */
const { ActionRowBuilder, ButtonBuilder, MessageFlags } = require("discord.js");
const { channel } = require("../../configuration/posts_manager.json");

module.exports = {
    name: "post-relance-yes",
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
        /* Ping dans le poste */
        let mbrs = [];
        await interaction.channel.members.fetch();
        await interaction.channel.members.cache.each(mbr => {
            if (mbr.id !== client.user.id && mbr.id !== interaction.channel.ownerId)
            mbrs.push(`<@${mbr.id}>`);
        });
        if (mbrs.length > 0)
            await interaction.reply({ content: mbrs.join(" ") + " pouvez vous l'aider s'il vous plait" });
        let msg = interaction.message;
        let cpnts = msg.components[0].components;
        cpnts = cpnts.map(cpnt => {
            return new ButtonBuilder({
                style: cpnt.data.style,
                label: cpnt.data.label,
                customId: cpnt.data.custom_id+"-disabled",
                disabled: true
            })
        });
        await msg.edit({ content: msg.content, components: [new ActionRowBuilder({ components: cpnts })] });

        /* Message aux Maîtres */
        const ch = await interaction.guild.channels.fetch(channel);
        ch.send({ content: `Quelqu'un a besoin d'aide ici : https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}` });
    }
}