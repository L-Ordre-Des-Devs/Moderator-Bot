const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { 
    DefaultWebSocketManagerOptions: { 
        identifyProperties 
    } 
} = require("@discordjs/ws");
const { WebhookConsole } = require("discord-webhook-console");
const { PrismaClient } = require('@prisma/client');
// To show the bot on mobile :D (method from : https://stackoverflow.com/a/77072376)
identifyProperties.browser = "Discord Android";

// Discord app
let client = new Client({
    intents: [
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.console = new WebhookConsole(process.env.WEBHOOK_LOG);
client.prisma = new PrismaClient();
client.reviewCache = new Map();
module.exports = client;

// Global Variables
client.commandsFiles = new Collection();

// Initializing the project
require("./handler")(client);

client.login(process.env.TOKEN);
