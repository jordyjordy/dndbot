import {getConnectionContainer} from "../connectionManager"
import { MessageComponentInteraction } from "discord.js"
import { getMessageContent } from "../utils/interface"
import { LoopEnum } from "../utils/loop"
import { interfaceCommand } from "."
const data = {
    name:'loop',
}
export const execute = async function(msg:MessageComponentInteraction):Promise<void> {
    if(!msg.guildId) {
        return;
    }
    const connectionManager = await getConnectionContainer(msg.guildId)
    let option = connectionManager.loop
    switch(option) {
        case LoopEnum.ONE:
            option = LoopEnum.NONE
            break;
        case LoopEnum.NONE:
            option = LoopEnum.ALL
            break
        default:
            option = LoopEnum.ONE
            break
    }
    connectionManager.shuffle = false
    connectionManager.toggleLoop(option)
    try {
        msg.update(getMessageContent(connectionManager))
    } catch (err) {
        console.error(err);
    }

}

export const Command:interfaceCommand = {info:data,command:execute}