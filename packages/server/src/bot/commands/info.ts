import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js';
import { reply } from '../utils/messageReply';
import Item from '../../model/item';
const data = new SlashCommandBuilder()
    .setName('info')
    .setDescription('Provides info about characters!')
    .addStringOption(option => option.setName('query').setDescription('Enter a name or part of a name'))

export const execute = async function(msg:CommandInteraction):Promise<void> {
    if(!msg.guildId || !msg.guild) {
        return;
    }
    await msg.deferReply();
    const args = Array.from(msg.options.data.values()).map(entry => entry.value?.toString() ?? '')
    if (args.length == 0) {
        reply(msg, "Please specify what you want information about, for example type `?info Villads`")
        return
    }
    let query = ""
    for (let i = 0; i < args.length; i++) {
        query += args[i]
        if (i < args.length - 1) {
            query += " "
        }
    }
    try {
        const result = await Item.findByName(query, msg.guild.id);
        if (result.length > 0) {
            let resultString = ``
            for (let i = 0; i < result.length; i++) {
                resultString += `**Name:** ${result[i].name} **Type:** ${result[i].type} \n \n${result[i].details}\n`
                if (i + 1 < result.length) {
                    resultString += "----------------------------------------\n"
                }
            }
            reply(msg, resultString)

        } else {
            reply(msg, "No information was found with that name")
        }
    } catch(err) {
        console.error(err)
    }

}

export const Command = {info:data,command:execute}