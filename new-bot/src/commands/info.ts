import axios from 'axios'
import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js';
import { reply } from '../utils/messageReply';
const data = new SlashCommandBuilder()
    .setName('info')
    .setDescription('Provides info about characters!')
    .addStringOption(option => option.setName('query').setDescription('Enter a name or part of a name'))

export const execute = async function(msg:CommandInteraction):Promise<void> {
    await msg.deferReply();
    const args = Array.from(msg.options.data.values()).map(entry => entry.value.toString())
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
        axios.get(process.env.SERVER_IP + `/item/name?name=${query}&server=${msg.guild.id}`).then(function (response) {
            if (response.data.length > 0) {
                let resultString = ``
                for (let i = 0; i < response.data.length; i++) {
                    resultString += `**Name:** ${response.data[i].name} **Type:** ${response.data[i].type} \n \n${response.data[i].details}\n`
                    if (i + 1 < response.data.length) {
                        resultString += "----------------------------------------\n"
                    }
                }
                reply(msg, resultString)

            } else {
                reply(msg, "No information was found with that name")
            }
        })
    } catch(err) {
        console.log(err.message)
    }

}

export const Command = {info:data,command:execute}