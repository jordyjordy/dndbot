import {getConnectionContainer} from "../connectionManager"
import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from "discord.js"
import { updateInterface } from "../utils/interface"

const data = new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clears a song (number) or all songs ("all") from the queue')
    .addSubcommand(command => command.setName('all').setDescription('clear the whole'))
    .addSubcommand(command => command.setName('song').setDescription('enter an index')
    .addStringOption(option => option.setName('index').setDescription("index of song to remove")))

export const execute = async function(msg:CommandInteraction):Promise<void> {
    const args = Array.from(msg.options.data.values()).map(entry => entry.value.toString())
    const connectionManager = await getConnectionContainer(msg)
    try{
        if(args[0] === "all") {
            if(!connectionManager.clearQueue()) {
                msg.editReply("Something went wrong clearing the queue")
            }
        } else if(args.length > 0) {
            try {
                if(!connectionManager.removeSong(args[0])) {
                    msg.editReply("The song you are trying to remove is currently being played, or does not exist!")
                }
            } catch(err) {
                msg.editReply("Something went wrong clearing this item from the queue")
            }
        }
        updateInterface(msg,connectionManager)
    } catch(err) {
        console.log(err)
    }
}

export const Command = {info:data,command:execute}
