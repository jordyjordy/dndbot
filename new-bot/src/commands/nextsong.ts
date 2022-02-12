import {getConnectionContainer} from "../connectionManager"
import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from "discord.js"
import { updateInterface } from "../utils/interface"
const data = new SlashCommandBuilder()
    .setName('ns')
    .setDescription('Play the next song in the queue')
 
export const execute = async function(msg:CommandInteraction):Promise<void> {
    await msg.deferReply();
    const connectionManager = await getConnectionContainer(msg.guildId)
    try {
        await connectionManager.nextSong()
        updateInterface(connectionManager,msg,false,false,true)
    } catch(err) {
        console.error(err)
    }
}

export const Command = {info:data,command:execute}