/*
 * author : Mizari (Mizari-Dev)
 */
const { ApplicationCommandType, ApplicationCommandOptionType, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "help",
  description: "Send pre-build message, usefull for new members.",
  descriptionLocalizations: {fr: "Envoi un message pré-fait, util aux nouveaux membres"},
  options: [
    {
      name: "category",
      nameLocalizations: {fr: "categorie"},
      description: "The category of the demand.",
      descriptionLocalizations: {fr: "La catégorie de la demande."},
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        {
          name: "Dev",
          value: "dev"
        },
        {
          name: "Cybersec",
          value: "cybersec",
        },
        {
          name: "IT",
          nameLocalizations: {fr: "Informatique"},
          value: "it"
        }
      ]
    }
  ],
  type: ApplicationCommandType.ChatInput,
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {String[]} args
   */
  run: async(client, interaction, args) => {
    await interaction.deferReply({ ephemeral: false }).catch(() => {});
    const categ = args[0];
    let msg = "";

    switch(categ) {
      case "dev":
        msg = "Bonjour jeune développeur ! Si tu cherches à apprendre la programmation je te conseille de lire nos <#1045653867167219782>. Si tu as des questions/besoin d'aide sur du code tu peux les poser dans <#1045654459130335262>. Pour plus de détails fais un tour dans <#1131248149072187445>.";
        break;
      case "cybersec":
        msg = "Bonjour jeune hackeur ! Si tu cherches à apprendre la cybersécurité je te conseille de lire nos <#1078322242825502811>. Si tu as des questions tu peux les poser dans <#1078318803328434307>. Pour plus de détails fais un tour dans <#1131248149072187445>.";
        break;
      case "it":
        msg = "Bonjour jeune informaticien ! Si tu as des questions sur l'informatique en général, ou des problèmes avec ton PC/tel, tu peux poser tes questions ici <#1094952753282953216>. Pour plus de détails fais un tour dans <#1131248149072187445>.";
        break;
    }

    interaction.followUp({ content: msg });
  }
}
