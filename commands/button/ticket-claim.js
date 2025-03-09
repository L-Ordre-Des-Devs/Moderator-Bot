/*
 * author : Syxles (Syxless) & Mizari (Mizari-Dev)
 */
const { ButtonBuilder } = require("discord.js");
const ticketConfig = require('../../configuration/tickets.json');

module.exports = {
  name: "ticket-claim",
  type: "Button",
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  run: async(client, interaction) => {
    const { prisma } = client;
    // Récupérer le ticket depuis la DB
    let ticket = await prisma.ticket.findUnique({ where: { channelId: interaction.channel.id } });
  
    if (!ticket) {
      return interaction.reply({ content: 'Ticket introuvable.', ephemeral: true });
    }

    if (ticket.status !== 'open') {
      return interaction.reply({ content: 'Ce ticket n’est pas “open”.', ephemeral: true });
    }

    // Vérifier si l'utilisateur a un rôle staff
    const hasStaffRole = ticketConfig.staffRoles.some(r => interaction.member.roles.cache.has(r));
    if (!hasStaffRole) {
      return interaction.reply({ content: 'Pas autorisé.', ephemeral: true });
    }

    // Mettre à jour le ticket dans la DB
    ticket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: 'claimed',
        claimedBy: interaction.user.id
      }
    });

    // Mettre à jour le bouton "Claim" dans le salon de ticket
    const channel = interaction.guild.channels.cache.get(ticket.channelId);
    if (channel) {
      const messages = await channel.messages.fetch({ limit: 10 });
      const botMsg = messages.find(m => m.author.id === client.user.id && m.components?.length);
      if (botMsg) {
        const row = botMsg.components[0];
        if (row) {
          const idx = row.components.findIndex(c => c.customId?.startsWith('ticket-claim-'));
          if (idx > -1) {
            const claimBtn = ButtonBuilder.from(row.components[idx])
              .setLabel(`Claimed by ${interaction.user.username}`)
              .setDisabled(true);
            row.components[idx] = claimBtn;
            await botMsg.edit({ components: [row] });
          }
        }
      }
    }

    await interaction.reply({ content: `Ticket #${ticket.id} claimé par ${interaction.user}.`, ephemeral: false });
  }
}
