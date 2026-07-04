/*
 * author : Mizari (Mizari-Dev)
 */
const { ApplicationCommandType, SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "info",
  description: "Infos diverses et variées",
  descriptionLocalizations: {
    "fr": "Info diverses et variées"
  },
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Infos diverses et variées")
    .addSubcommand(sub =>
      sub.setName("regledesfautes")
        .setDescription("La règle 1 faute = 5 pompes")
    ),
  type: ApplicationCommandType.ChatInput,
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {String[]} args
   */

  run: async (client, interaction) => {
    const sub = interaction.options.getSubcommand();
    let embed = new EmbedBuilder();

    switch (sub) {
      case "regledesfautes":
        embed.setTitle("Règle des fautes")
          .setDescription(
            `L'Ordre des Devs est un serveur qui regroupe les passionnés de l'informatique (et ceux qui aiment un peu ça aussi) (ah, et les fans de Star Wars). OR, ceci implique que nous sommes des geeks, des geeks oui, mais des geeks attachés au bon français.

C'EST POURQUOI la règle "1 faute = 5 pompes" a été instaurée ([juste ici](https://discord.com/channels/706640777450881114/1105272846214779011/threads/1511772304810704991/1511772304810704991)). Cher padawan, pour assurer la qualité de nos échanges, prenez cette règle en compte.

May the </> be with you.`
          )
          .setColor(0x008000);
        break;
    }
    await interaction.reply({ embeds: [embed] });
  },
};
