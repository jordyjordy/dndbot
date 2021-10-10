import {getConnectionContainer} from "../connectionManager"
import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from "discord.js"
import { updateInterface } from "../utils/interface"
import { reply } from '../utils/messageReply';

const data = new SlashCommandBuilder()
    .setName('resume')
    .setDescription('continue/start song playback')
 
export const execute = async function(msg:CommandInteraction):Promise<void> {
    await msg.deferReply();
    const connectionManager = await getConnectionContainer(msg)
    try{
        if(!connectionManager.isConnected()) {
            if(!await connectionManager.connect(msg)) {
                reply(msg, "Something went wrong, Are you sure you are in a voice channel?")
                return
            }
        }
        await connectionManager.play()
        updateInterface(connectionManager,msg,false,false,true)
    } catch(err) {
        console.log(err)
    }
}

export const Command = {info:data,command:execute}