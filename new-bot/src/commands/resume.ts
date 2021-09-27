import {getConnectionContainer} from "../connectionManager"
import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from "discord.js"
import { updateInterface } from "../utils/interface"
const data = new SlashCommandBuilder()
    .setName('resume')
    .setDescription('continue/start song playback')
 
export const execute = async function(msg:CommandInteraction):Promise<void> {
    const connectionManager = await getConnectionContainer(msg)
    try{
        connectionManager.play()
        updateInterface(msg,connectionManager)
    } catch(err) {
        console.log(err)
    }
}

export const Command = {info:data,command:execute}