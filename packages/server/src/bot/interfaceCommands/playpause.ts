import { getConnection} from "../connectionManager"
import { MessageComponentInteraction } from "discord.js"
import { getMessageContent } from "../utils/interface"
import { interfaceCommand } from "."
const data = {
    name:'playpause',
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
        if(connectionManager.playing) {
            await connectionManager.pause()
        } else {
            await connectionManager.play()
        }
        msg.update(getMessageContent(connectionManager))
    } catch(err) {
        console.error("COULD CONNECT FROM SELECT MENU?!")
        console.error(err)
    }
}

export const Command:interfaceCommand = {info:data,command:execute}