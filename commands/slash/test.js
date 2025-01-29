/*
 * author : Mizari (Mizari-Dev)
 */
const { ApplicationCommandType } = require("discord.js");
const { LogContent, Levels } = require("../../functions/webhookLog.js");

module.exports = {
    name: "test",
    description: "Bot latency.",
    descriptionLocalizations:{
      "fr":"Latence du bot."
    },
    type: ApplicationCommandType.ChatInput,
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        const contents = [
            new LogContent(Levels.Valid, "test\ntest\ntest"),
            "blablabla",
            new LogContent(Levels.Error, "test\ntest\ntest"),
            1234567890,
            new LogContent(Levels.Warn, "HAHAHA")
        ];
        client.webhookLog.send("TEST", 1234567890).catch(err => {
            client.webhookLog.send("Error", [
                new LogContent(Levels.Error, `${err}`)
            ]);
        });

        await interaction.deferReply({ ephemeral: false }).catch(() => {});
        let time = interaction.createdAt;
        interaction.followUp({ content: `pong! 🏓` }).then(msg => {
            msg.edit({ content: `${msg.content} ${
            {
                "fr": "avec"
            }[interaction.locale] || "with"
            } ${msg.createdAt - time}ms`});
        });
    },
};