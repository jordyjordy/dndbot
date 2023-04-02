import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from "discord.js";
import { updateInterface } from "../utils/interface";
import { reply } from "../utils/messageReply";
import client from '../';
const data = new SlashCommandBuilder()
    .setName('addsong')
    .setDescription('Adds a song to the music queue, optional param to indicate the index')
    .addStringOption(option => option.setName('url').setDescription('Enter a youtube url').setRequired(true))
    .addStringOption(option => option.setName('name').setDescription('Override video name').setRequired(false));

const execute = async function(msg:CommandInteraction):Promise<void> {
    if(!msg.guildId) {
        return;
    }
    await msg.deferReply();
    const args = Array.from(msg.options.data.values()).map(entry => entry.value?.toString() ?? '');
    const { connectionManager, queueManager } = await client.getConnection(msg.guildId);
    try{
        if(args.length > 1) {
            await queueManager.queueSong({ url: args[0], name: args[1] }).catch(err => {
                reply(msg,`something went wrong: ${err.message}`);
            });
        } else {
            await queueManager.queueSong({url: args[0] }).catch(err => {
                reply(msg,`something went wrong: ${err.message}`);
            });
        }
        await reply(msg, "You queued: " + args[0]);
        updateInterface(connectionManager,msg,true);
    } catch(err) {
        console.error(err);
    }
};

export const Command = {info:data,command:execute};  
