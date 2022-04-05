import {getConnectionContainer} from "../connectionManager"
import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from "discord.js"
import { updateInterface } from "../utils/interface"
import { reply } from '../utils/messageReply';

const data = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Join audio channel and start playing a song')
    .addStringOption(option => option.setName('song').setDescription('Enter a youtube url or queue index'))

export const execute = async function(msg:CommandInteraction):Promise<void> {
    console.log('waaa');
    await msg.deferReply();
    const args = Array.from(msg.options.data.values()).map(entry => entry.value.toString())
    const connectionManager = await getConnectionContainer(msg.guildId)
    try{
        if(!connectionManager.isConnected()) {
            const connect = await connectionManager.connect(msg)
            if(!connect) {
                reply(msg, "Something went wrong, Are you sure you are in a voice channel?")
                return
            }
        }
        if(args.length == 0) {
            if(!connectionManager.play()) {
                reply(msg, "Can not play a song, are you sure there is something in the queue?")     
            } else {
                updateInterface(connectionManager,msg)
            }
            return
        }
        await connectionManager.playSong(args[0]).then(() => {
            reply(msg, "You are playing: " + args[0])
            updateInterface(connectionManager,msg,true)
        }).catch((err) => {
            reply(msg, `something went wrong: ${err.message}`);
        });
    } catch(err) {
        console.error(err)
    }
}

export const Command = {info:data,command:execute}