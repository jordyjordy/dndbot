import { getConnection } from "../connectionManager";
import { SelectMenuInteraction } from "discord.js";
import { getMessageContent } from "../utils/interface";
import { interfaceCommand } from ".";

const data = {
    name:'clear',
};

export const execute = async function(msg:SelectMenuInteraction):Promise<void> {
    if(!msg.guildId) {
        return;
    }
    const { connectionManager, queueManager } = await getConnection(msg.guildId);
    try{
        if(!await queueManager.clearQueue()) {
            msg.editReply("Something went wrong clearing the queue");
        }
        await msg.update(getMessageContent(connectionManager));
    } catch(err) {
        console.error(err);
    }
};

export const Command:interfaceCommand = {info:data,command:execute};