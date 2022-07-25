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
    try {
        sendQueueMessage(connectionContainer, msg,getMessageContent(connectionContainer),newmsg,edit)
    } catch (err) {
        console.error(err)
    }
}

async function sendQueueMessage(connectionContainer:ConnectionContainer, msg:CommandInteraction | undefined, message: messageContent, newmsg: boolean, edit: boolean) {
    let channel: TextBasedChannel
    if(!msg || !msg.channel) {
        if(!connectionContainer.queueMessage) return
        channel = connectionContainer.queueMessage.channel
        newmsg = true
    } else {
        channel = msg.channel
    }
    try{
        if(edit) {
            if(!newmsg && connectionContainer.queueMessage && msg) {
                deleteReply(msg)
                connectionContainer.queueMessage.edit(message)
            } else if(msg) {
                reply(msg,message)
            }
            return
        }
        if (newmsg) {
            connectionContainer.queueMessage = await channel.send(message)
        } else if (msg) {  
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

function generatePlaylistSelectRow(connnectionContainer: ConnectionContainer):MessageActionRow {
    if(!connnectionContainer.playlists || connnectionContainer.playlists.length <= 0) {
        return new MessageActionRow();
    }
    const placeholder = connnectionContainer.playlist + ': ' + connnectionContainer.playlists[connnectionContainer.playlist].name
    const row = new MessageActionRow().addComponents(
        new MessageSelectMenu()
            .setCustomId('playlistSelect')
            .setPlaceholder(placeholder.substring(0, Math.min(80, placeholder.length)))
            .addOptions(connnectionContainer.playlists.map((el, id) => {
                const label = id + ": " + el.name.substring(0,Math.min(80,el.name.length))
                return {label, description: '', value: id.toString()}
            }).filter((el, id) => id < 25))
    );
    return row;
}

function generateSelectRow(connectionContainer:ConnectionContainer):MessageActionRow {
    if(connectionContainer.getCurrentQueue().length === 0) {
        return new MessageActionRow();
    }
    let playingText = "PLAYING"
    if(connectionContainer.currentsong > connectionContainer.getCurrentQueue().length - 1) {
        return new MessageActionRow();
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
    if(connectionContainer.currentsongplaylist !== connectionContainer.playlist) {
        playingText = ""
    }
    const row = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('play')
                .setPlaceholder(connectionContainer.currentsong + ": " + connectionContainer.getCurrentQueue()[connectionContainer.currentsong].name)
                .addOptions(connectionContainer.getCurrentQueue().map((el,id) => {
                    const name = id + ": "+ el.name.substring(0,Math.min(80,el.name.length))
                    return {label:name, description:(connectionContainer.currentsong === id?playingText:""),value:id.toString()}
                }).filter((el, id) => id < 25))
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
                .setLabel("Empty Playlist")
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
export function getMessageContent(connectionContainer:ConnectionContainer):messageContent {
    const response = generateText(connectionContainer)
    const playlistRow = generatePlaylistSelectRow(connectionContainer) as MessageActionRow;
    const selectrow = generateSelectRow(connectionContainer) as MessageActionRow
    const components: MessageActionRow[] = []
    if(playlistRow) {
        components.push(playlistRow)
    }
    if(selectrow !== null) {
        components.push(selectrow)
    }
    components.push(genererateButtonRow(connectionContainer))
    components.push(generateSecondaryButtonRow(connectionContainer))
    components.push(generateTeriaryButtonRow())
    return {content:response, components:components}
}

export interface messageContent {
    content:string,
    components: MessageActionRow[],
}