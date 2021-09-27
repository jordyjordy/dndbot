import {getConnectionContainer} from "../connectionManager"
import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from "discord.js"
import { updateInterface } from "../utils/interface"

const data = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Join audio channel and start playing a song')
    .addStringOption(option => option.setName('song').setDescription('Enter a youtube url or queue index').setRequired(true))

export const execute = async function(msg:CommandInteraction):Promise<void> {
    const args = Array.from(msg.options.data.values()).map(entry => entry.value.toString())
    const connectionManager = await getConnectionContainer(msg)
    try{
        if(!connectionManager.isConnected()) {
            const connect = await connectionManager.connect(msg)
            if(!connect) {
                msg.editReply("Something went wrong, Are you sure you are in a voice channel?")
                return
            }
        }
        if(args.length == 0) {
            if(!connectionManager.play()) {
                msg.editReply("Can not play a song, are you sure there is something in the queue?")     
            } else {
                updateInterface(msg,connectionManager)
            }
            return
        }
        if(!await connectionManager.playSong(args[0])) {
            msg.editReply("something went wrong, possibly you entered a bad url or number")
            updateInterface(msg,connectionManager,true)
        } else {
            await msg.editReply("You are playing: " + args[0])
            updateInterface(msg,connectionManager,true)
        }
    } catch(err) {
        console.log(err)
    }
}

export const Command = {info:data,command:execute}