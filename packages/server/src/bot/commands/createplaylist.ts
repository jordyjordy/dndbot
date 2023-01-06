import { getConnection } from "../connectionManager";
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from "discord.js";
import { updateInterface } from "../utils/interface";
import { reply } from "../utils/messageReply";
const data = new SlashCommandBuilder()
    .setName('createplaylist')
    .setDescription('creates a new playlist')
    .addStringOption(option => option.setName('name').setDescription('Enter a name').setRequired(true));

const execute = async function(msg:CommandInteraction):Promise<void> {
    if(!msg.guildId) {
        return;
    }
    await msg.deferReply();
    const args = Array.from(msg.options.data.values()).map(entry => entry.value?.toString() ?? '');
    const { connectionManager, queueManager } = await getConnection(msg.guildId);
    try{
        if(!await queueManager.createPlaylist(args[0])) {
            reply(msg,"something went wrong, possibly you entered a bad url.");
        }
        await reply(msg, "You added " + args[0]);
        updateInterface(connectionManager,msg,true);
    } catch(err) {
        console.error(err);
    }
};

export const Command = {info:data,command:execute};  
