import {getConnectionContainer} from "../connectionManager"
import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from "discord.js"
import { updateInterface } from "../utils/interface"
const data = new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause song playback')
 
export const execute = async function(msg:CommandInteraction):Promise<void> {
    await msg.deferReply();
    const connectionManager = await getConnectionContainer(msg)
    try{
        connectionManager.pause()
        updateInterface(connectionManager,msg,false,false,true)
    } catch(err) {
        console.log(err)
    }
}

export const Command = {info:data,command:execute}