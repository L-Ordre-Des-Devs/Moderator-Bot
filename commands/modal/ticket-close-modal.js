/*
 * author : Syxles (Syxless) & Mizari (Mizari-Dev)
 */
const {
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder
} = require("discord.js");
const discordTranscripts = require('discord-html-transcripts');
const ticketConfig = require('../../configuration/tickets.json');

module.exports = {
    name: "ticket-close-modal",
    type: "Modal",
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        const { prisma, console } = client;
        const { ticketId } = interaction;
        const closeReason = interaction.fields.getTextInputValue('ticketCloseReason') || 'Aucune raison';

        let ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
        if (!ticket) {
            return interaction.reply({ content: 'Ticket introuvable.', ephemeral: true });
        }

        if (ticket.status === 'closed') {
            return interaction.reply({ content: 'Ticket déjà fermé.', ephemeral: true });
        }

        // Mettre à jour le ticket dans la DB
        ticket = await prisma.ticket.update({
            where: { id: ticket.id },
            data: {
                status: 'closed',
                closedAt: new Date(),
                close_reason: closeReason
            }
        });

        const channel = interaction.guild.channels.cache.get(ticket.channelId);
        if (channel) {
            await channel.permissionOverwrites.edit(ticket.userId, {
                ViewChannel: false,
                SendMessages: false,
                ReadMessageHistory: false
            });
        }

        let transcriptFile;
        if (channel) {
            try {
                transcriptFile = await discordTranscripts.createTranscript(channel, {
                    fileName: `ticket-${ticket.id}.html`
                });
            } catch (err) {
                console.error('Error generating transcript:', err);
            }
        }

        const embed = new EmbedBuilder()
            .setTitle(`Ticket #${ticket.id} fermé`)
            .setColor('#ff0000')
            .setDescription(`Raison: **${closeReason}**\nL'utilisateur n'a plus accès à ce salon.`)
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`ticket-delete-${ticket.id}`)
                .setLabel('🗑️ Supprimer définitivement')
                .setStyle(ButtonStyle.Danger)
        );

        await interaction.reply({ embeds: [embed], components: [row] });

        const logsChannel = client.channels.cache.get(ticketConfig.logsChannel);
        if (logsChannel) {
            const durationMs = ticket.closedAt.getTime() - ticket.createdAt.getTime();
            const durationMinutes = Math.floor(durationMs / 60000);

            const embedLog = new EmbedBuilder()
                .setTitle(`Ticket #${ticket.id} fermé`)
                .setColor('#ff0000')
                .addFields(
                    { name: 'Auteur', value: `<@${ticket.userId}>`, inline: true },
                    { name: 'Claimé par', value: ticket.claimedBy ? `<@${ticket.claimedBy}>` : 'Non claimé', inline: true },
                    { name: 'Ouvert le', value: `<t:${Math.floor(ticket.createdAt.getTime() / 1000)}:F>`, inline: false },
                    { name: 'Fermé le', value: `<t:${Math.floor(ticket.closedAt.getTime() / 1000)}:F>`, inline: false },
                    { name: 'Durée', value: `${durationMinutes} minute(s)`, inline: true },
                    { name: 'Raison d\'ouverture', value: ticket.open_reason || 'Non spécifiée', inline: false },
                    { name: 'Raison de fermeture', value: closeReason, inline: false },
                    { name: 'Avis de l\'utilisateur', value: ticket.rating ? `**Note**: ${ticket.rating}/5\n**Commentaire**: ${ticket.review_comment || 'Aucun commentaire.'}` : 'Pas de review.' }
                )
                .setFooter({ text: `Salon: #${channel?.name || ticket.channelId}` })
                .setTimestamp();

            if (transcriptFile) {
                await logsChannel.send({
                    embeds: [embedLog],
                    files: [transcriptFile]
                });
            } else {
                await logsChannel.send({
                    embeds: [embedLog]
                });
            }
        }

        try {
            const user = await client.users.fetch(ticket.userId);

            const dmEmbed = new EmbedBuilder()
                .setTitle(`Votre ticket #${ticket.id} est fermé`)
                .setDescription(`Raison: **${closeReason}**\n\nMerci d'avoir utilisé notre support ! Nous serions ravis de recevoir votre avis.`)
                .setColor('#ff9900')
                .setTimestamp();

            const select = new StringSelectMenuBuilder()
                .setCustomId(`ticket-review-select-${ticket.id}`)
                .setPlaceholder('Choisissez une note (ou pas d\'avis)')
                .addOptions([
                    {
                        label: 'Aucun avis',
                        description: 'Ne pas donner de note',
                        value: '0',
                        emoji: '❌'
                    },
                    {
                        label: '1 étoile',
                        description: '1 sur 5',
                        value: '1',
                        emoji: '⭐'
                    },
                    {
                        label: '2 étoiles',
                        description: '2 sur 5',
                        value: '2',
                        emoji: '🌟'
                    },
                    {
                        label: '3 étoiles',
                        description: '3 sur 5',
                        value: '3',
                        emoji: '✨'
                    },
                    {
                        label: '4 étoiles',
                        description: '4 sur 5',
                        value: '4',
                        emoji: '💫'
                    },
                    {
                        label: '5 étoiles',
                        description: '5 sur 5',
                        value: '5',
                        emoji: '💯'
                    }
                ]);


            const selectRow = new ActionRowBuilder().addComponents(select);

            await user.send({
                embeds: [dmEmbed],
                files: transcriptFile ? [transcriptFile] : [],
                components: [selectRow]
            });
        } catch (err) {
            console.error(`Impossible d'envoyer le DM de review à l'utilisateur ${ticket.userId}:`, err);
        }
    }
}
