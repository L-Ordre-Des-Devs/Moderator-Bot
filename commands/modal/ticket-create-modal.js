/*
 * author : Syxles (Syxless) & Mizari (Mizari-W)
 */
const {
    ChannelType,
    ActionRowBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");
const ticketConfig = require('../../configuration/tickets.json');

module.exports = {
    name: "ticket-create-modal",
    type: "Modal",
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        const { prisma } = client;

        await interaction.deferReply({ ephemeral: true });

        // Vérifier le nombre de tickets ouverts/claimés par l'utilisateur
        const userTicketsCount = await prisma.ticket.count({
            where: {
                userId: interaction.user.id,
                OR: [{ status: 'open' }, { status: 'claimed' }]
            }
        });
        if (userTicketsCount >= ticketConfig.maxTicketsPerUser) {
            return interaction.editReply({ content: 'Vous avez déjà un ticket ouvert.', ephemeral: true });
        }

        // Générer un ID unique pour le ticket (si tu ne le gères pas via @default(cuid()))
        const ticketId = Date.now().toString(36).toUpperCase();

        // Créer le salon de ticket
        const channel = await interaction.guild.channels.create({
            name: `ticket-${ticketId}`,
            type: ChannelType.GuildText,
            parent: ticketConfig.ticketCategory,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                },
                ...ticketConfig.staffRoles.map(r => ({
                    id: r,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.ManageMessages
                    ]
                }))
            ]
        });

        const openReason = interaction.fields.getTextInputValue('ticketOpenReason');
        const type = interaction.ticketId;
        // Enregistrer le ticket dans la DB
        const newTicket = await prisma.ticket.create({
            data: {
                id: ticketId,
                channelId: channel.id,
                userId: interaction.user.id,
                type,
                status: 'open',
                open_reason: openReason,
                lastActivity: new Date()
            }
        });

        // Créer un embed de bienvenue dans le salon de ticket
        const tpl = ticketConfig.templates[type] || ticketConfig.templates['general'];
        const embed = new EmbedBuilder()
            .setColor(tpl.color || '#2B2D31')
            .setTitle(`${tpl.emoji || '🎫'} Ticket #${ticketId}`)
            .setDescription(`Ticket créé par <@${interaction.user.id}>.\n\n**Raison** : ${openReason}`)
            .setTimestamp();

        // Ajouter des boutons "Claim" et "Fermer"
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`ticket-claim-${ticketId}`)
                .setLabel('Claim')
                .setEmoji('🛎️')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`ticket-close-${ticketId}`)
                .setLabel('Fermer')
                .setEmoji('<:cross:1163970998605983848>')
                .setStyle(ButtonStyle.Danger)
        );

        await channel.send({ embeds: [embed], components: [row] });

        // Informer l'utilisateur que le ticket a été créé
        await interaction.editReply({ content: `Ticket créé : <#${channel.id}>`, ephemeral: true });
    }
}
