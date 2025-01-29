const client = require("../index");
const { LogContent, Levels } = require("../functions/webhookLog.js");
const { ActivityType } = require("discord.js");

client.on("ready", () => {
   const contents = [
      new LogContent(Levels.Valid, `Logged in as ${client.user.tag}!`)
   ];
   client.webhookLog.send("Logged in", contents);
   console.log("✅");
   client.user.setActivity(`May the </> be with you!`, {type: ActivityType.Custom});
});
