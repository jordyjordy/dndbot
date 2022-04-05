import {getConnectionContainer} from "../connectionManager"
import { MessageComponentInteraction } from "discord.js"
import { getMessageContent } from "../utils/interface"
import { interfaceCommand } from "."
import { LoopEnum } from "../utils/loop"
const data = {
    name:'shuffle',
}
export const execute = async function(msg:MessageComponentInteraction):Promise<void> {
    const connectionManager = await getConnectionContainer(msg.guildId)
    const bool = !connectionManager.shuffle
    if(bool) {
        connectionManager.loop = LoopEnum.NONE
    }
    connectionManager.toggleShuffle(bool)
    try {
        msg.update(getMessageContent(connectionManager))
    } catch (err) {
        console.log(err)
    }
}

export const Command:interfaceCommand = {info:data,command:execute}