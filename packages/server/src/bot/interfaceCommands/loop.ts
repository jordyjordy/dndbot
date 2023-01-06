import { getConnection } from "../connectionManager";
import { MessageComponentInteraction } from "discord.js";
import { getMessageContent } from "../utils/interface";
import { LoopEnum } from "../utils/loop";
import { interfaceCommand } from ".";
const data = {
    name:'loop',
};
export const execute = async function(msg:MessageComponentInteraction):Promise<void> {
    if(!msg.guildId) {
        return;
    }
    const { connectionManager, queueManager } = await getConnection(msg.guildId);
    let option = queueManager.loop;
    switch(option) {
        case LoopEnum.ONE:
            option = LoopEnum.NONE;
            break;
        case LoopEnum.NONE:
            option = LoopEnum.ALL;
            break;
        default:
            option = LoopEnum.ONE;
            break;
    }
    queueManager.shuffle = false;
    queueManager.toggleLoop(option);
    try {
        msg.update(getMessageContent(connectionManager));
    } catch (err) {
        console.error(err);
    }

};

export const Command:interfaceCommand = {info:data,command:execute};