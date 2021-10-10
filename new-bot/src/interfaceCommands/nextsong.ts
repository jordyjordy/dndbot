import {getConnectionContainer} from "../connectionManager"
import { MessageComponentInteraction } from "discord.js"
import { getMessageContent } from "../utils/interface"
import { interfaceCommand } from "."
const data = {
    name:'ns',
}
export const execute = async function(msg:MessageComponentInteraction):Promise<void> {
    const connectionManager = await getConnectionContainer(msg)
    try{
        await connectionManager.nextSong()
        msg.update(getMessageContent(connectionManager))
    } catch(err) {
        console.error(err)
    }
}

export const Command:interfaceCommand = {info:data,command:execute}