import {getConnectionContainer} from "../connectionManager"
import { SelectMenuInteraction } from "discord.js"
import { getMessageContent } from "../utils/interface"
import { interfaceCommand } from "."

const data = {
    name:'clear',
}

export const execute = async function(msg:SelectMenuInteraction):Promise<void> {
    const connectionManager = await getConnectionContainer(msg)
    try{
        if(!connectionManager.clearQueue()) {
            msg.editReply("Something went wrong clearing the queue")
        }
        await msg.update(getMessageContent(connectionManager))
    } catch(err) {
        console.log(err)
    }
}

export const Command:interfaceCommand = {info:data,command:execute}