/*
 * author : Syxles (Syxless) & Mizari (Mizari-W)
 */
const {
    ApplicationCommandType,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    PermissionsBitField,
    ButtonStyle
} = require("discord.js");
const ticketConfig = require('../../configuration/tickets.json');

module.exports = {
    name: "ticket-setup",
    description: "Créer un panel de tickets.",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: PermissionsBitField.Flags.Administrator,
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        const embed = new EmbedBuilder()
            .setTitle('Panel de Tickets')
            .setDescription('Cliquez sur un bouton ci-dessous pour ouvrir un ticket.')
            .setColor('#5865F2');

        const fields = Object.entries(ticketConfig.templates).map(([key, tpl]) => ({
            name: `${tpl.emoji} ${tpl.name}`,
            value: tpl.description,
            inline: true
        }));
        embed.addFields(fields);

        const row = new ActionRowBuilder().addComponents(
            ...Object.entries(ticketConfig.templates).map(([key, tpl]) => (
                new ButtonBuilder()
                    .setCustomId(`ticket-create-${key}`)
                    .setEmoji(tpl.emoji)
                    .setLabel(`${tpl.name}`)
                    .setStyle(ButtonStyle.Primary)
            ))
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
}
