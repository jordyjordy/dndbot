import { getConnection} from "../connectionManager"
import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from "discord.js"
import { updateInterface } from "../utils/interface"
import { reply } from "../utils/messageReply"

const data = new SlashCommandBuilder()
    .setName('deleteplaylist')
    .setDescription('creates a new playlist')
    .addNumberOption(option => option.setName('id').setDescription('Enter an index').setRequired(true))

const execute = async function(msg:CommandInteraction):Promise<void> {
    if(!msg.guildId) {
        return;
    }
    await msg.deferReply();
    const args = Array.from(msg.options.data.values()).map(entry => entry.value?.toString() ?? '')
    const { connectionManager, queueManager } = await getConnection(msg.guildId)
    try{
        if(!await queueManager.deletePlaylist(parseInt(args[0]))) {
            reply(msg,"something went wrong, possibly you entered a bad id or tried to delete the current playlist")
        } else {
            await reply(msg, "You deleted " + args[0])
        }
        updateInterface(connectionManager,msg,true)
    } catch(err) {
        console.error(err)
    }
}

export const Command = {info:data,command:execute}  
