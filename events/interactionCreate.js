const { ApplicationCommandOptionType } = require("discord.js");
const client = require("../index");

client.on("interactionCreate", async (interaction) => {
  if (!interaction.guild) {
    return interaction.reply("Can't do commands in PM :/");
  }

  // Slash Command Handling
  if (interaction.isChatInputCommand()) {

    const cmd = client.commandsFiles.get(interaction.commandName);
    if (!cmd)
      return interaction.reply({ content: "An error has occured", ephemeral: true });

    const args = [];

    for (let option of interaction.options.data) {
      if (option.type === ApplicationCommandOptionType.Subcommand) {
        if (option.name) args.push(option.name);
        option.options?.forEach((x) => {
          if (x.value) args.push(x.value);
        });
      } else if (option.value) args.push(option.value);
    }
    interaction.member = interaction.guild.members.cache.get(interaction.user.id);

    cmd.run(client, interaction, args);

    // Logs
    let contents = {
      'Type': "Slash command",
      'Author': interaction.user.username,
      'Channel': interaction.channel.name,
      'Cmd': interaction.commandName,
      'Args': args
    }
    client.console.table(contents);
  }

  // Context Menu Handling
  else if (interaction.isContextMenuCommand()) {
    await interaction.deferReply({ ephemeral: false });
    const command = client.commandsFiles.get(interaction.commandName);
    if (command) command.run(client, interaction);

    // Logs
    let contents = {
      'Type': "Menu interaction",
      'Author': interaction.user.username,
      'Channel': interaction.channel.name,
      'Cmd': interaction.commandName
    }
    client.console.table(contents);
  }

  // Modal Handling
  else if (interaction.isModalSubmit()){
    //await interaction.deferReply({ ephemeral: true });
    const command = client.commandsFiles.get(interaction.customId);
    if (command) command.run(client, interaction);

    // Logs
    let contents = {
      'Type': "Modal interaction",
      'Author': interaction.user.username,
      'Channel': interaction.channel.name,
      'Cmd': interaction.commandName
    }
    client.console.table(contents);
  }

  // Button Handling
  else if (interaction.isButton()){
    //await interaction.deferReply({ ephemeral: true });
    const btn = client.commandsFiles.get(interaction.customId);
    if (btn) btn.run(client, interaction);

    //Logs
    let contents = {
      'Type': "Button interaction",
      'Author': interaction.user.username,
      'Channel': interaction.channel.name,
      'Cmd': interaction.commandName
    }
    client.console.table(contents);
  }

  // Select Handling
  else if (interaction.isStringSelectMenu()){
    //await interaction.deferReply({ ephemeral: true });
    const select = client.commandsFiles.get(interaction.customId);
    if (select) select.run(client, interaction);

    //Logs
    let contents = {
      'Type': "Select interaction",
      'Author': interaction.user.username,
      'Channel': interaction.channel.name,
      'Cmd': interaction.commandName
    }
    client.console.table(contents);
  }
});
