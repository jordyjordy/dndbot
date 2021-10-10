import {getConnectionContainer} from "../connectionManager"
import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from "discord.js"
import { updateInterface } from "../utils/interface"
const data = new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Display the queue message')
 
export const execute = async function(msg:CommandInteraction):Promise<void> {
    await msg.deferReply();
    const connectionManager = await getConnectionContainer(msg)
    try{
        updateInterface(connectionManager,msg)
    } catch(err) {
        console.log(err)
    }
}

export const Command = {info:data,command:execute}