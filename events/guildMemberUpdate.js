const client = require("../index");

client.on("guildMemberUpdate", async (oldMember, newMember) => {
    // si l'ancien pending est différent du nouveau que le nouveau est false
	if(oldMember.pending !== newMember.pending && !newMember.pending){
        const { console } = client;

        // récupération du serv
    	const member = newMember;
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
            member: newMember.username,
        };
        console.table(content);
    }
});
