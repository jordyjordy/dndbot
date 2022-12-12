import { getConnection } from "../connectionManager"
import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from "discord.js"
import { updateInterface } from "../utils/interface"
const data = new SlashCommandBuilder()
    .setName('ps')
    .setDescription('Play the previous song in the queue') 
  
export const execute = async function(msg:CommandInteraction):Promise<void> {
    if(!msg.guildId) {
        return;
    }
    await msg.deferReply();
    const { connectionManager}  = await getConnection(msg.guildId)
    try{
        await connectionManager.previousSong()
        updateInterface(connectionManager,msg,false,false,true)
    } catch(err) {
        console.error(err)
    }
}

export const Command = {info:data,command:execute}