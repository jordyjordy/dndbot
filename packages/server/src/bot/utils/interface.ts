import { AudioPlayerStatus } from "@discordjs/voice"
import { CommandInteraction, Message, MessageActionRow, MessageButton, MessageSelectMenu, TextBasedChannel } from "discord.js"
import { ConnectionManager } from "../connectionManager"
import { LoopEnum } from "./loop"
import { reply, deleteReply } from '../utils/messageReply';

export async function updateInterface(connectionContainer:ConnectionManager,msg?:CommandInteraction ,newmsg=false,removeOld=true,edit=false):Promise<void> {
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

async function sendQueueMessage(connectionContainer:ConnectionManager, msg:CommandInteraction | undefined, message: messageContent, newmsg: boolean, edit: boolean) {
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



function getLoopIcon(connectionContainer:ConnectionManager):string {
    const queueManager = connectionContainer.queueManager
    if(queueManager.shuffle) {
        return ":twisted_rightwards_arrows:"
    }
    switch(queueManager.loop) {
        case LoopEnum.ALL:
            return ':repeat:'
        case LoopEnum.ONE:
            return ':repeat_one:'
        default:
            return ':blue_square:'
    }
}

function generateText(connectionContainer:ConnectionManager) {
    let response = ""
    response += "**Status: " + (connectionContainer.playing?':arrow_forward:':':pause_button:') +
    " PlayStyle: " + getLoopIcon(connectionContainer) + "**\n" 
    return response
}

function generatePlaylistSelectRow(connectionContainer: ConnectionManager):MessageActionRow | null {
    const queueManager = connectionContainer.queueManager;
    if(!queueManager.playlists || queueManager.playlists.length <= 0) {
        return null
    }
    const placeholder = queueManager.currentPlaylist + ': ' + queueManager.playlists[queueManager.currentPlaylist].name
    const row = new MessageActionRow().addComponents(
        new MessageSelectMenu()
            .setCustomId('playlistSelect')
            .setPlaceholder(placeholder.substring(0, Math.min(80, placeholder.length)))
            .addOptions(queueManager.playlists.map((el, id) => {
                const label = id + ": " + el.name.substring(0,Math.min(80,el.name.length))
                return {label, description: '', value: id.toString()}
            }).filter((el, id) => id < 25))
    );
    return row;
}

function generateSelectRow(connectionContainer:ConnectionManager):MessageActionRow | null {
    const queueManager = connectionContainer.queueManager;
    if(queueManager.getCurrentQueue().length === 0) {
        return null;
    }
    let playingText = "PLAYING"
    if(queueManager.currentSong > queueManager.getCurrentQueue().length - 1) {
        return null;
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
    if(queueManager.currentSongPlaylist !== queueManager.currentPlaylist) {
        playingText = ""
    }
    const row = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('play')
                .setPlaceholder(queueManager.currentSong + ": " + queueManager.getCurrentQueue()[queueManager.currentSong].name)
                .addOptions(queueManager.getCurrentQueue().map((el,id) => {
                    const name = id + ": "+ el.name.substring(0,Math.min(80,el.name.length))
                    return {label:name, description:(queueManager.currentSong === id?playingText:""),value:id.toString()}
                }).filter((el, id) => id < 25))
        )
    return row
}

function genererateButtonRow(connectionContainer:ConnectionManager):MessageActionRow {
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

function generateSecondaryButtonRow(connectionContainer:ConnectionManager):MessageActionRow {
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

function getLoopButtonStyle(connectionContainer:ConnectionManager) {
    const queueManager = connectionContainer.queueManager;
    switch(queueManager.loop) {
        case LoopEnum.ALL:
            return "PRIMARY"
        case LoopEnum.ONE:
            return "SUCCESS"
        default:
            return "SECONDARY"
    }
}

function getShuffleButtonStyle(connectionContainer:ConnectionManager):"PRIMARY"|"SECONDARY" {
    const queueManager = connectionContainer.queueManager;
    if(queueManager.shuffle) {
        return "PRIMARY"
    }
    return "SECONDARY"
}


function getPlayButtonStyleAndText(connectionContainer:ConnectionManager):{text:"Pause",style:"PRIMARY"}|{text:"Play",style:"SUCCESS"} {
    if(connectionContainer.playing) {
        return {text:"Pause",style:"PRIMARY"}
    }
    return {text:"Play",style:"SUCCESS"}
}
export function getMessageContent(connectionContainer:ConnectionManager):messageContent {
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