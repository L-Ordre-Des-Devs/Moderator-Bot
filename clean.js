const config = require("./configuration/clean.json");
const { help_forums, tags } = config;
let threads_visited = config.threads_visited;
const { WebhookConsole } = require("discord-webhook-console");
const fs = require("fs");
const token = process.env.TOKEN;
const guild = process.env.GUILD_ID;
const console = new WebhookConsole(process.env.WEBHOOK_LOG);
const baseURL = "https://discord.com/api/v10/";
const headers = {
    "Authorization": "Bot "+token,
    "Content-Type": "application/json"
}

/**
 * Get all the active threads in a specific guild
 * @returns A list of all active threads in the guild
 */
async function get_threads_active() {
    return await fetch(baseURL+"guilds/"+guild+"/threads/active", { headers: headers }).then(res => res.json());
}
/**
 * Get all the archived threads in a specific channel
 * @param {Snowflake} id The ID of the forum channel
 * @returns A list of all archived posts in the forum
 */
async function get_threads_archived(id) {
    return await fetch(baseURL+"channels/"+id+"/threads/archived/public", { headers: headers }).then(res => res.json());
}
/**
 * Wether the post is "résolu" or not
 * @param {Array<Snowflake>} thread_tags A list of the tags in the thread
 * @returns If the thread is "résolu" or not
 */
function has_tag(thread_tags) {
    if (thread_tags === undefined)
        return false;

    for (let i = 0; i < tags.length; i++){
        if (thread_tags.includes(tags[i]))
            return true;
    }
    return false;
}
/**
 * Wether a member is in the guild or not
 * @param {Snowflake} id The ID of the member
 * @returns If the member is in the guild or not
 */
async function is_in_guild(id){
    const resp = await fetch(baseURL+"guilds/"+guild+"/members/"+id, { headers: headers }).then(res => res.json());

    if (resp.message === 'You are being rate limited.')
        return new Promise((resolve, reject) => {
            setTimeout(
                () => resolve(is_in_guild(id)),
                resp.retry_after*1000
            );
        });

    let result = resp.message !== 'Unknown Member';
    return result;
}
/**
 * Wether the first message of the thread is deleted or not
 * @param {ThreadChannel} thread The thread object
 * @returns If the first message of the post is deleted or not
 */
async function first_message_is_deleted(thread) {
    let last_message = thread.last_message_id;
    let messages = [last_message];
    if (thread.message_count > 100){
        const turns = thread.message_count*0.01;
        for (let i = 0; i < turns; i++){
            let tmp_messages = await get_messages(thread.id, last_message);
            last_message = tmp_messages[tmp_messages.length-1].id;
            messages.push(...tmp_messages);
        }
    } else {
        messages = await fetch(baseURL+"channels/"+thread.id+"/messages?limit=100", { headers: headers }).then(res => res.json());
    }
    return thread.message_count === messages.length;
}
/**
 * Get messages in a thread
 * @param {Snowflake} thread_id The ID of the Thread
 * @param {Snowflake} last_message_id The ID of the last message
 * @returns A list of 100 max messages
 */
async function get_messages(thread_id, last_message_id) {
    let resp = await fetch(baseURL+"channels/"+thread_id+"/messages?limit=100&before="+last_message_id, { headers: headers }).then(res => res.json());

    if (resp.message === 'You are being rate limited.'){
        return new Promise((resolve, reject) => {
            setTimeout(
                () => resolve(get_messages(thread_id, last_message_id)),
                resp.retry_after*1000
            );
        });
    }

    return resp;
}

(async () => {
    console.log("Starting cleaning...");
    let deleted_count = 0;
    /* --- First: check threads saved in config --- */
    // for all threads visited
    for (let i = 0; i < threads_visited.length; i++){
        // get thread
        let thread = await fetch(baseURL+"channels/"+threads_visited[i].thread_id, { headers: headers }).then(res => res.json());
        // if last message is R2
        if (thread.last_message_id === threads_visited[0].bot_message_id){
            // delete thread
            await fetch(baseURL+"channels/"+thread.id, { headers: headers, method: "DELETE" });
            deleted_count++;
        }
    }
    // clear threads visited list
    threads_visited = [];

    /* --- Second: check all threads --- */
    // get all active threads
    const { threads } = await get_threads_active();
    let filtred_threads = [];
    // filter the list to have only threads in desire forum
    if (threads)
        filtred_threads = threads.filter(th => help_forums.includes(th.parent_id))
    // for all desired forum
    for (let i = 0; i < help_forums.length; i++){
        // get his archived threads
        let tmp = await get_threads_archived(help_forums[i]);
        // add them to the list
        if (tmp.threads)
            filtred_threads.push(...tmp.threads);
    }

    // for all the threads retrieved
    for (let i = 0; i < filtred_threads.length; i++){
        // get thread in variable
        let thread = filtred_threads[i];
        // check if orginal message is deleted
        const first_message_deleted = await first_message_is_deleted(thread);

        // if yes
        if (first_message_deleted){
            // delete thread
            await fetch(baseURL+"channels/"+thread.id, { headers: headers, method: "DELETE" });
            deleted_count++;
            continue;
        }

        // if not deleted, but is archived and hasn't a resolved tag
        if (thread.thread_metadata.archived && !has_tag(thread.applied_tags)){
            // check if the OP is in guild
            const in_guild = await is_in_guild(thread.owner_id);
            // if not
            if (!in_guild){
                // delete thread
                await fetch(baseURL+"channels/"+thread.id, { headers: headers, method: "DELETE" });
                deleted_count++;
                continue;
            }

            // if OP is in guild, send a message
            const message = `<@${thread.owner_id}> Avez vous encore besoin d'aide ?`;
            const btn_yes = {
                type: 2,
                style: 3,
                label: "Oui",
                custom_id: "post-relance-yes"
            }
            const btn_no = {
                type: 2,
                style: 4,
                label: "Non",
                custom_id: "post-relance-no"
            }
            let resp = await fetch(
                baseURL+"channels/"+thread.id+"/messages",
                {
                    headers: headers,
                    method: "POST",
                    body: JSON.stringify({
                        content: message,
                        components: [
                            {
                                type: 1,
                                components: [
                                    btn_yes,
                                    btn_no
                                ]
                            }
                        ]
                    })
                }
            ).then(res => res.json());
            // save it in threads visited list
            threads_visited.push({"thread_id":thread.id, "bot_message_id":resp.id});
        }
    }

    // right new config in the config file
    config.threads_visited = threads_visited;
    fs.writeFile("./configuration/clean.json", JSON.stringify(config), (err) => {
        if (err) return console.error(err);
        console.log("config updated");
    });
    console.log(`Cleaned ${deleted_count} thread${deleted_count>1?"s":""}.`);
})();
