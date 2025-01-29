const { WebhookClient, EmbedBuilder, resolveColor } = require("discord.js");

const Levels = {
    Info: "info",
    Valid: "valid",
    Warn: "warn",
    Error: "error"
}

class WebhookLog{
    /**
     * 
     * @param {String} url 
     */
    constructor(url){
        this.webhook = new WebhookClient({ url: url });
    }

    /**
     * Send logs via webhook
     * @param {String} title 
     * @param {Array} content 
     */
    async send(title, contents) {
        if (contents.constructor !== Array){
            throw new Error("Expected array of LogContent");
        }

        let content = "";
        for (let i = 0; i < contents.length; i++) {
            if (contents[i].constructor !== LogContent)
                continue;
            content += contents[i].parseContent()+"\n"
        }

        if (content === ""){
            throw new Error("None of the content is valid");
        }

        var embed = new EmbedBuilder({
            color: {
                "info": resolveColor("#75C5D6"),
                "valid": resolveColor("#A5EA78"),
                "warn": resolveColor("#FFCC4D"),
                "error": resolveColor("#FF6464")
            }[contents[0].level] || resolveColor("#2B2D31"),
            title: title,
            description: content
        });
    
        await this.webhook.send({ embeds: [embed] });
    }
}


class LogContent{
    /**
     * 
     * @param {String} level 
     * @param {String} content 
     */
    constructor(level, content){
        this.level = level
        this.content = content
    }

    /**
     * 
     * @returns {String}
     */
    parseContent(){
        return "```"+({
            "info": "fix\n",
            "valid": "diff\n+ ",
            "error": "diff\n- "
        }[this.level] || "")+this.content.replaceAll("\n", {
            "valid": "\n+ ",
            "error": "\n- "
        }[this.level] || "\n")+"```"
    }
}

module.exports = { Levels, WebhookLog, LogContent };