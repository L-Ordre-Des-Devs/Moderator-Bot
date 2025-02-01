/*
 * author : Syxles (Syxless) & Mizari (Mizari-W)
 */
const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "ticket-admin",
  description: "Centre de gestion des tickets.",
  type: ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionsBitField.Flags.ManageChannels,
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {String[]} args
   */
  run: async(client, interaction, args) => {
    await interaction.deferReply({ ephemeral: true });

    // Récupérer tous les tickets "open" ou "claimed" depuis la DB
    const tickets = await prisma.ticket.findMany({
      where: {
        OR: [{ status: 'open' }, { status: 'claimed' }]
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (!tickets.length) {
      return interaction.editReply("Aucun ticket ouvert ou en cours.");
    }

    const embed = new EmbedBuilder()
      .setTitle('Centre de Gestion des Tickets')
      .setDescription('Liste des tickets ouverts/claimés')
      .setColor('#00AAFF');

    const lines = tickets.map(t => {
      const claimedTxt = t.claimedBy ? ` (Claimé par <@${t.claimedBy}>)` : '';
      return `**Ticket #${t.id}** : <@${t.userId}>${claimedTxt} | Salon: <#${t.channelId}>`;
    });

    embed.setDescription(lines.join('\n'));

    // Créer une row de boutons pour chaque ticket
    const rows = [];
    for (const t of tickets) {
      // 4 boutons : "Aller au Salon", "Claim", "Fermer", "Supprimer"
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Aller au salon')
          .setStyle(ButtonStyle.Link)
          .setURL(`https://discord.com/channels/${interaction.guildId}/${t.channelId}`),

        new ButtonBuilder()
          .setCustomId(`ticket-claim-${t.id}`)
          .setLabel('🛎️ Claim')
          .setStyle(ButtonStyle.Success)
          .setDisabled(Boolean(t.claimedBy)),

        new ButtonBuilder()
          .setCustomId(`ticket-close-${t.id}`)
          .setLabel('❌ Fermer')
          .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
          .setCustomId(`ticket-delete-${t.id}`)
          .setLabel('🗑️ Supprimer')
          .setStyle(ButtonStyle.Secondary)
      );
      rows.push(row);
    }

    // Limite Discord à 5 rows max par message
    const MAX_ROWS = 5;
    const paginatedRows = [];

    for (let i = 0; i < rows.length; i += MAX_ROWS) {
      paginatedRows.push(rows.slice(i, i + MAX_ROWS));
    }

    await interaction.editReply({ embeds: [embed], components: paginatedRows[0] });
  }
}
