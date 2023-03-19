import client from '../';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from "discord.js";
import { updateInterface } from "../utils/interface";
const data = new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Toggle shuffling')
    .addSubcommand(command => command.setName('on').setDescription("shuffle"))
    .addSubcommand(command => command.setName('off').setDescription("stop shuffling"));

export const execute = async function(msg:CommandInteraction):Promise<void> {
    await msg.deferReply();
    if(!msg.guildId) {
        return;
    }
    const { connectionManager, queueManager } = await client.getConnection(msg.guildId);
    const toggle = msg.options.getSubcommand();
    const bool = toggle === "on"?true:false;

    queueManager.toggleShuffle(bool);
    updateInterface(connectionManager,msg,false,false,true);
};

export const Command = {info:data,command:execute};