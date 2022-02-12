import {getConnectionContainer} from "../connectionManager"
import { MessageComponentInteraction } from "discord.js"
import { updateInterface } from "../utils/interface"
import { interfaceCommand } from "."
const data = {
    name:'reload',
}
export const execute = async function(msg:MessageComponentInteraction):Promise<void> {
    const connectionManager = await getConnectionContainer(msg.guildId)
    try{
        await msg.deferReply()
        updateInterface(connectionManager,undefined,true,true)
        await msg.deleteReply()
    } catch(err) {
        console.error(err)
    }
}

export const Command:interfaceCommand = {info:data,command:execute}