import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { reply } from '../utils/messageReply';
import Token from '../../model/token';

const data = new SlashCommandBuilder()
    .setName('passcode')
    .setDescription('Request a passcode to be able to edit the database') 

export const execute = async function(msg:CommandInteraction):Promise<void> {
    if(!msg.guildId || !msg.member || !msg.guild) {
        return;
    }
    const token = await Token.generateToken(msg.member.user.username,msg.guild.id);
    reply(msg, {content:"Your private code is: `" + token + "`. It's valid for 3 hours!", ephemeral: true})
}


export const Command = {info:data,command:execute}