import axios from 'axios'
import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'

const data = new SlashCommandBuilder()
    .setName('passcode')
    .setDescription('Request a passcode to be able to edit the database') 

export const execute = function(msg:CommandInteraction):void {
    axios.get(process.env.SERVER_IP + `/token?user=${msg.member.user.username}&server=${msg.guild.id}`).then(function (response) {
        msg.deleteReply()
        msg.reply({content:"Your private code is: `" + response.data.result + "`. It's valid for 3 hours!",ephemeral:true})
    }).catch((err) => {
        console.log(err)
    })
}


export const Command = {info:data,command:execute}