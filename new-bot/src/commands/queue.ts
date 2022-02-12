import {getConnectionContainer} from "../connectionManager"
import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from "discord.js"
import { updateInterface } from "../utils/interface"
const data = new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Display the queue message')
 
export const execute = async function(msg:CommandInteraction):Promise<void> {
    await msg.deferReply();
    const connectionManager = await getConnectionContainer(msg.guildId)
    try{
        updateInterface(connectionManager,msg)
    } catch(err) {
        console.error(err)
    }
}

export const Command = {info:data,command:execute}