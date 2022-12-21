import { getConnection } from "../connectionManager"
import { MessageComponentInteraction } from "discord.js"
import { getMessageContent } from "../utils/interface"
import { interfaceCommand } from "."
const data = {
    name:'replay',
}
export const execute = async function(msg:MessageComponentInteraction):Promise<void> {
    if(!msg.guildId) {
        return;
    }
    const { connectionManager } = await getConnection(msg.guildId)
    if(!connectionManager.isConnected()) {
        await connectionManager.connect(msg)
    }
    try{
        await connectionManager.play()
        msg.update(getMessageContent(connectionManager))
    } catch(err) {
        console.error(err)
    }
}

export const Command:interfaceCommand = {info:data,command:execute}