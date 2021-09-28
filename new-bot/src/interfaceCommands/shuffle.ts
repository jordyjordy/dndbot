import {getConnectionContainer} from "../connectionManager"
import { MessageComponentInteraction } from "discord.js"
import { getMessageContent } from "../utils/interface"
import { interfaceCommand } from "."
import { LoopEnum } from "../utils/loop"
const data = {
    name:'shuffle',
}
export const execute = async function(msg:MessageComponentInteraction):Promise<void> {
    const connectionManager = await getConnectionContainer(msg)
    const bool = !connectionManager.shuffle
    if(bool) {
        connectionManager.loop = LoopEnum.NONE
    }
    connectionManager.toggleShuffle(bool)
    msg.update(getMessageContent(connectionManager))
}

export const Command:interfaceCommand = {info:data,command:execute}