/*
 * author : Mizari (Mizari-Dev)
 */
const { ApplicationCommandType, ApplicationCommandOptionType, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "banhammer",
  description: "Ban a member",
  descriptionLocalizations: {fr: "Ban un membre"},
  options: [
    {
      name: "member",
      nameLocalizations: {fr: "membre"},
      description: "The member you want to ban",
      descriptionLocalizations: {fr: "Le membre que vous voulez bannir"},
      type: ApplicationCommandOptionType.User,
      required: true
    },
    {
      name: "reason",
      nameLocalizations: {fr: "raison"},
      description: "The reason of the ban",
      descriptionLocalizations: {fr: "La raison du ban"},
      type: ApplicationCommandOptionType.String,
      required: false
    }
  ],
  type: ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionsBitField.Flags.BanMembers,
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {String[]} args
   */
  run: async(client, interaction, args) => {
    await interaction.deferReply({ ephemeral: false }).catch(() => {});
    // vérification que le bot a la perm de ban
    if (interaction.guild.members.resolve(client.user).permissions.has(PermissionsBitField.Flags.BanMembers)) {
      const userID = args[0]; // l'ID du membre à ban
      const mbr = interaction.guild.members.cache.get(userID); // le membre à ban
      // maintenant on vérifie que la victime est bannable
      if (mbr && mbr.bannable) {
        var reason = "none"; // initialisation de la raison
        // si une raison est donnée on la stock dans "reason"
        if (args.length > 1) {
          reason = args[1];
        }

        // on envoit un message MP à la victime
        await mbr.createDM().then(ch => {
          ch.send({
            "fr": `Vous avez été banni de ${interaction.guild.name} par ${interaction.user.tag} pour la raison "${reason}"`
          }[interaction.locale] || `You've been banned from ${interaction.guild.name} by ${interaction.user.tag} for the reason "${reason}"`).catch();
        }).catch();
        // on indique que la personne s'est fait ban et on donne l'auteur du ban
        await interaction.followUp({ content: {
          "fr": `${mbr.user.tag} s'est pris un violent coup de banhammer sur la tête de la part de ${interaction.user}`
          }[interaction.locale] || `${mbr.user.tag} took a violent banhammer hit on the head by ${interaction.user}`});
        // on ban la victime
        await mbr.ban({ reason: `"${reason}" par ${interaction.user.tag}` }).catch();
      // si la victime n'est pas bannable
      } else {
        interaction.followUp({ content : {
          "fr": "Je ne peux pas bannir cette personne"
          }[interaction.locale] || "I can't ban this member" });
      }
    // si le bot a pas la perm de ban
    } else {
      interaction.followUp({ content: {
        "fr": "J'ai pas la perm de ban..."
       }[interaction.locale] || "I don't have permission to ban..."});
    }
  }
}
