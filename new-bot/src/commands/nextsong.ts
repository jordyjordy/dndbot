import {getConnectionContainer} from "../connectionManager"
import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from "discord.js"
import { updateInterface } from "../utils/interface"
const data = new SlashCommandBuilder()
    .setName('ns')
    .setDescription('Play the next song in the queue')
 
export const execute = async function(msg:CommandInteraction):Promise<void> {
    const connectionManager = await getConnectionContainer(msg)
    try {
        await connectionManager.nextSong()
        updateInterface(connectionManager,msg,false,false,true)
    } catch(err) {
        console.log(err)
    }
}

export const Command = {info:data,command:execute}