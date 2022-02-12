import { AudioPlayerStatus } from "@discordjs/voice"
import { CommandInteraction, Message, MessageActionRow, MessageButton, MessageSelectMenu, TextBasedChannel } from "discord.js"
import { ConnectionContainer } from "../connectionManager"
import { LoopEnum } from "./loop"
import { reply, deleteReply } from '../utils/messageReply';

export async function updateInterface(connectionContainer:ConnectionContainer,msg?:CommandInteraction ,newmsg=false,removeOld=true,edit=false):Promise<void> {
    if(connectionContainer.queueMessage && removeOld) {
        if(!connectionContainer.queueMessage.deleted) {
            try{
                await connectionContainer.queueMessage.delete()
            } catch(err) {
                console.error(err)
            }
        }
        connectionContainer.queueMessage = undefined
    }
    sendQueueMessage(connectionContainer,msg,getMessageContent(connectionContainer),newmsg,edit)
        
}

async function sendQueueMessage(connectionContainer:ConnectionContainer, msg:CommandInteraction, message, newmsg, edit) {
    let channel: TextBasedChannel
    if(!msg) {
        if(!connectionContainer.queueMessage) return
        channel = connectionContainer.queueMessage.channel
        newmsg = true
    } else {
        channel = msg.channel
    }
    try{
        if(edit) {
            if(!newmsg && connectionContainer.queueMessage) {
                deleteReply(msg)
                connectionContainer.queueMessage.edit(message)
            } else {
                reply(msg,message)
            }
            return
        }
        if (newmsg) {
            connectionContainer.queueMessage = await channel.send(message)
        } else {  
            await reply(msg, message);
            connectionContainer.queueMessage = await msg.fetchReply() as Message
        }
    } catch(err) {
        console.error(err)
    }
}



function getLoopIcon(connectionContainer:ConnectionContainer):string {
    if(connectionContainer.shuffle) {
        return ":twisted_rightwards_arrows:"
    }
    switch(connectionContainer.loop) {
        case LoopEnum.ALL:
            return ':repeat:'
        case LoopEnum.ONE:
            return ':repeat_one:'
        default:
            return ':blue_square:'
    }
}

function generateText(connectionContainer:ConnectionContainer) {
    let response = ""
    response += "**Status: " + (connectionContainer.playing?':arrow_forward:':':pause_button:') +
    " PlayStyle: " + getLoopIcon(connectionContainer) + "**\n" 
    return response
}

function generateSelectRow(connectionContainer:ConnectionContainer):MessageActionRow {
    let playingText = "PLAYING"
    if(connectionContainer.currentsong > connectionContainer.queue.length - 1) {
        return new MessageActionRow()
    }
    if(!connectionContainer.playing ) {
        if(!connectionContainer.audioPlayer) {
            playingText = "SELECTED"
        }
        else if(connectionContainer.audioPlayer.state.status === AudioPlayerStatus.Paused
            || connectionContainer.audioPlayer.state.status === AudioPlayerStatus.AutoPaused) {
            playingText = "PAUSED"
        } else {
            playingText = "SELECTED"
        }
    }
    const row = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('songselect')
                .setPlaceholder(connectionContainer.currentsong + ": " + connectionContainer.queue[connectionContainer.currentsong].name)
                .addOptions(connectionContainer.queue.map((el,id) => {
                    const name = id + ": "+ el.name.substring(0,Math.min(80,el.name.length))
                    return {label:name, description:(connectionContainer.currentsong === id?playingText:""),value:id.toString()}
                }))
        )
    return row
}

function genererateButtonRow(connectionContainer:ConnectionContainer):MessageActionRow {
    const row = new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setCustomId("playpause")
            .setLabel(getPlayButtonStyleAndText(connectionContainer).text)
            .setStyle(getPlayButtonStyleAndText(connectionContainer).style),
        new MessageButton()
            .setCustomId("ps")
            .setLabel("Previous Song")
            .setStyle("SECONDARY"),
        new MessageButton()
        .setCustomId("ns")
        .setLabel("Next Song")
        .setStyle("SECONDARY"),
        new MessageButton()
        .setCustomId("stop")
        .setLabel("Stop")
        .setStyle("DANGER")
    )
    return row
}

function generateSecondaryButtonRow(connectionContainer:ConnectionContainer):MessageActionRow {
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId("replay")
            .setLabel('Replay')
            .setStyle("SECONDARY"),
            new MessageButton()
                .setCustomId("loop")
                .setLabel('Loop')
                .setStyle(getLoopButtonStyle(connectionContainer)),
            new MessageButton()
                .setCustomId("shuffle")
                .setLabel('Shuffle')
                .setStyle(getShuffleButtonStyle(connectionContainer)),
            new MessageButton()
                .setCustomId("reload")
                .setLabel('Reload Interface')
                .setStyle("PRIMARY"),
        )
    return row
}

function generateTeriaryButtonRow():MessageActionRow {
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('clear')
                .setLabel("Clear Queue")
                .setStyle("DANGER")
        )
    return row
}

function getLoopButtonStyle(connectionContainer:ConnectionContainer) {
    switch(connectionContainer.loop) {
        case LoopEnum.ALL:
            return "PRIMARY"
        case LoopEnum.ONE:
            return "SUCCESS"
        default:
            return "SECONDARY"
    }
}

function getShuffleButtonStyle(connectionContainer:ConnectionContainer):"PRIMARY"|"SECONDARY" {
    if(connectionContainer.shuffle) {
        return "PRIMARY"
    }
    return "SECONDARY"
}


function getPlayButtonStyleAndText(connectionContainer:ConnectionContainer):{text:"Pause",style:"PRIMARY"}|{text:"Play",style:"SUCCESS"} {
    if(connectionContainer.playing) {
        return {text:"Pause",style:"PRIMARY"}
    }
    return {text:"Play",style:"SUCCESS"}
}
export function getMessageContent(connectionContainer:ConnectionContainer):{content:string,components:MessageActionRow[]} {
    const response = generateText(connectionContainer)
    const selectrow = generateSelectRow(connectionContainer)
    
    const components = []
    if(connectionContainer.queue.length > 0) {
        components.push(selectrow)
    }
    components.push(genererateButtonRow(connectionContainer))
    components.push(generateSecondaryButtonRow(connectionContainer))
    components.push(generateTeriaryButtonRow())
    return {content:response, components:components}
}