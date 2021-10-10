import {getConnectionContainer} from "../connectionManager"
import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from "discord.js"
import { updateInterface } from "../utils/interface"
import { reply } from "../utils/messageReply"
const data = new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clears a song (number) or all songs ("all") from the queue')
    .addSubcommand(command => command.setName('all').setDescription('clear the whole'))
    .addSubcommand(command => command.setName('song').setDescription('enter an index')
    .addStringOption(option => option.setName('index').setDescription("index of song to remove")))

export const execute = async function(msg:CommandInteraction):Promise<void> {
    await msg.deferReply();
    const args = msg.options.getSubcommand()
    const connectionManager = await getConnectionContainer(msg)
    try{
        if(args === "all") {
            if(!connectionManager.clearQueue()) {
                reply(msg, "Something went wrong clearing the queue")
            }
        } else if(args) {
            const val = msg.options.getString('index')
            if(!connectionManager.removeSong(val)) {
                reply(msg, "The song you are trying to remove is currently being played, or does not exist!")
            }
        }
        updateInterface(connectionManager,msg,false,false,true)
    } catch(err) {
        console.error(err)
    }
}

export const Command = {info:data,command:execute}
