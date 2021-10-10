import {getConnectionContainer} from "../connectionManager"
import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from "discord.js"
import { updateInterface } from "../utils/interface"
const data = new SlashCommandBuilder()
    .setName('replay')
    .setDescription('Restart the current song') 
   
export const execute = async function(msg:CommandInteraction):Promise<void> {
    await msg.deferReply();
    const connectionManager = await getConnectionContainer(msg)
    if(!connectionManager.isConnected()) {
        await connectionManager.connect(msg)
    }
    try{
        await connectionManager.replay()
        updateInterface(connectionManager,msg,false,false,true)
    } catch(err) {
        console.log(err)
    }
}

export const Command = {info:data,command:execute}