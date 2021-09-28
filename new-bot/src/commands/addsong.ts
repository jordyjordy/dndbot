import {getConnectionContainer} from "../connectionManager"
import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from "discord.js"
import { updateInterface } from "../utils/interface"
const data = new SlashCommandBuilder()
    .setName('addsong')
    .setDescription('Adds a song to the music queue, optional param to indicate the index')
    .addStringOption(option => option.setName('url').setDescription('Enter a youtube url').setRequired(true))

const execute = async function(msg:CommandInteraction):Promise<void> {
    const args = Array.from(msg.options.data.values()).map(entry => entry.value.toString())
    const connectionManager = await getConnectionContainer(msg)
    try{
        if(args.length > 1) {
            if(!await connectionManager.queueSong(args[0],parseInt(args[1]))) {
                msg.editReply("something went wrong, possibly you entered a bad url.")
            }
        } else {
            if(!await connectionManager.queueSong(args[0])) {
                msg.editReply("something went wrong, possibly you entered a bad url.")
            }
        }
        await msg.editReply("You queued: " + args[0])
        updateInterface(connectionManager,msg,true)
    } catch(err) {
        console.log(err)
    }
}

export const Command = {info:data,command:execute}  
