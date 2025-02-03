const client = require("../index");
const { console } = client;
const { GuildMemberFlags } = require("discord.js");

client.on("guildMemberUpdate", async (oldMember, newMember) => {
    // si l'ancien pending est différent du nouveau que le nouveau est false
    if (!oldMember.flags.has(GuildMemberFlags.CompletedOnboarding) && newMember.flags.has(GuildMemberFlags.CompletedOnboarding)) {
        Welcome(newMember);
    }
});

/**
 * Add role and send message to welcome new member
 * @param {GuildMember} member The member
 * @returns {void} void
 */
function Welcome(member) {
    // récupération du serv
    const { guild } = member;
    if (guild.id !== process.env.GUILD_ID)
        return;

    var channel = process.env.WELCOME_CHNL;
    var msg = process.env.WELCOME_MSG;

    msg = msg.replaceAll("{server.name}", guild.name);
    msg = msg.replaceAll("{server.description}", guild.description);
    msg = msg.replaceAll("{member.name}", member.user.username);
    msg = msg.replaceAll("{member.tag}", member.user.tag);
    msg = msg.replaceAll("{member}", member);
    msg = msg.replaceAll("\\n", String.fromCharCode(10));

    guild.channels.cache.get(channel).send(msg);

    let role = process.env.WELCOME_ROLE;
    role = guild.roles.cache.get(role);
    member.roles.add(role).catch(err => console.error(err));

    let content = {
        message: "New member",
        member: member.user.username,
    };
    console.table(content);
}