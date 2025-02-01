const client = require("../index");
const { ActivityType } = require("discord.js");

client.on("ready", () => {
   client.console.log(`Logged in as ${client.user.tag}!`);
   console.log("✅");
   client.user.setActivity(`May the </> be with you!`, {type: ActivityType.Custom});
});
