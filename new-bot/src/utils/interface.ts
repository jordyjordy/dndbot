import { CommandInteraction, Message } from "discord.js"
import { ConnectionContainer } from "../connectionManager"
import { LoopEnum } from "./loop"

export async function updateInterface(msg:CommandInteraction,connectionContainer:ConnectionContainer ,newmsg=false):Promise<void> {
    if(connectionContainer.queueMessage) {
        connectionContainer.queueMessage.delete()
        connectionContainer.queueMessage = undefined
    }
    let response = "**Status: " + (connectionContainer.playing?':arrow_forward:':':pause_button:') +
        " Loop: " + getLoopIcon(connectionContainer) + "**\n" 
    if(!connectionContainer.queue || connectionContainer.queue.length === 0) {
        response += "The queue is empty!"
        if(newmsg) {
            connectionContainer.queueMessage = await msg.channel.send(response)
        } else {
            await msg.editReply(response)
            connectionContainer.queueMessage = await msg.fetchReply() as Message
        }
        return
    }
    for(let i = 0; i < connectionContainer.queue.length;i++) {
        if(i == connectionContainer.currentsong) {
            response += "**" + i + ": " + connectionContainer.queue[i].name + "**" + " \n"  
        } else {
            response +=  i + ": " + connectionContainer.queue[i].name + " \n"
        }     
    }
    if(newmsg) {
        connectionContainer.queueMessage = await msg.channel.send(response)
    } else {
        await msg.editReply(response)
        connectionContainer.queueMessage = await msg.fetchReply() as Message
    }
        
}

function getLoopIcon(connectionContainer:ConnectionContainer):string {
    switch(connectionContainer.loop) {
        case LoopEnum.ALL:
            return ':repeat:'
        case LoopEnum.ONE:
            return ':repeat_one:'
        default:
            return ':blue_square:'
    }
}
