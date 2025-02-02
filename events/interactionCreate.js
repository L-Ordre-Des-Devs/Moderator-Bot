const { ApplicationCommandOptionType, InteractionType } = require("discord.js");
const client = require("../index");
const { console } = client;

client.on("interactionCreate", async (interaction) => {
    if (!interaction.guild && interaction.type === InteractionType.ApplicationCommand) {
        return interaction.reply("Can't do commands in PM :/");
    }

    // Slash Command Handling
    if (interaction.isChatInputCommand()) {
        SlashCommandHandler(interaction);
        return;
    }

    // Context Menu Handling
    if (interaction.isContextMenuCommand()) {
        ContextMenuHandler(interaction);
        return;
    }

    // Modal Handling
    if (interaction.isModalSubmit()) {
        ModalHandler(interaction);
        return;
    }

    // Button Handling
    if (interaction.isButton()) {
        ButtonHandler(interaction);
        return;
    }

    // Select Handling
    if (interaction.isStringSelectMenu()) {
        SelectHandler(interaction);
        return;
    }
});

/**
 * Handler for slash commands
 * @param {ChatInputCommandInteraction} interaction The slash command interaction 
 * @returns {Promise<InteractionCallbackResponse>} reply
 */
function SlashCommandHandler(interaction) {
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
    console.table(contents);
}

/**
 * Handler for context menus
 * @param {ContextMenuCommandInteraction} interaction The context menu interaction
 */
async function ContextMenuHandler(interaction) {
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
    console.table(contents);
}

/**
 * Handler for modals
 * @param {ModalSubmitInteraction} interaction The modal interaction
 */
function ModalHandler(interaction) {
    let modal_name;
    const { customId } = interaction;
    if (customId.startsWith("ticket")) {
        modal_name = customId.split("-");
        interaction.ticketId = modal_name.pop();
        modal_name = modal_name.join("-");
    } else {
        modal_name = customId;
    }

    const modal = client.commandsFiles.get(modal_name);
    if (modal) modal.run(client, interaction);

    // Logs
    let contents = {
        'Type': "Modal interaction",
        'Author': interaction.user.username,
        'Channel': interaction.channel?.name,
        'Cmd': modal_name
    }
    console.table(contents);
}

/**
 * Handler for buttons
 * @param {ButtonInteraction} interaction The button interaction 
 */
function ButtonHandler(interaction) {
    let button_name;
    const { customId } = interaction;
    if (customId.startsWith("ticket")) {
        button_name = customId.split("-");
        interaction.ticketId = button_name.pop();
        button_name = button_name.join("-");
    } else {
        button_name = customId;
    }

    const btn = client.commandsFiles.get(button_name);
    if (btn) btn.run(client, interaction);

    //Logs
    let contents = {
        'Type': "Button interaction",
        'Author': interaction.user.username,
        'Channel': interaction.channel?.name,
        'Cmd': button_name
    }
    console.table(contents);
}

/**
 * Handler for selects
 * @param {StringSelectMenuInteraction} interaction The select interaction 
 */
function SelectHandler(interaction) {
    let select_name;
    const { customId } = interaction;
    if (customId.startsWith("ticket")) {
        select_name = customId.split("-");
        interaction.ticketId = select_name.pop();
        select_name = select_name.join("-");
    } else {
        button_name = customId;
    }

    const select = client.commandsFiles.get(select_name);
    if (select) select.run(client, interaction);

    //Logs
    let contents = {
        'Type': "Select interaction",
        'Author': interaction.user.username,
        'Channel': interaction.channel?.name,
        'Cmd': select_name
    }
    console.table(contents);
}