import { getConnection } from "../connectionManager"
import { SelectMenuInteraction } from "discord.js"
import { getMessageContent } from "../utils/interface"
import { interfaceCommand } from "."
const data = {
    name:'playlistSelect',
}

export const execute = async function(msg:SelectMenuInteraction):Promise<void> {
    if(!msg.guildId) {
        return;
    }
    const args = msg.values[0]
    const { connectionManager, queueManager } = await getConnection(msg.guildId)
    try{
        queueManager.setPlayList(parseInt(args))
        msg.update(getMessageContent(connectionManager))
    } catch(err) {
        console.error("COULD CONNECT FROM SELECT MENU?!")
        console.error(err)
    }
}

export const Command:interfaceCommand = {info:data,command:execute}