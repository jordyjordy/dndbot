import { getConnection } from "../connectionManager";
import { MessageComponentInteraction } from "discord.js";
import { getMessageContent } from "../utils/interface";
import { interfaceCommand } from ".";
import { LoopEnum } from "../utils/loop";
const data = {
    name:'shuffle',
};
export const execute = async function(msg:MessageComponentInteraction):Promise<void> {
    if(!msg.guildId) {
        return;
    }
    const { connectionManager, queueManager } = await getConnection(msg.guildId);
    const bool = !queueManager.shuffle;
    if(bool) {
        queueManager.loop = LoopEnum.NONE;
    }
    queueManager.toggleShuffle(bool);
    try {
        msg.update(getMessageContent(connectionManager));
    } catch (err) {
        console.error(err);
    }
};

export const Command:interfaceCommand = {info:data,command:execute};