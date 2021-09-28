
import axios from 'axios'
import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js';

const data = new SlashCommandBuilder()
    .setName('dnd')
    .setDescription('Gives time until the next session!')

const execute = function(msg:CommandInteraction):void {
    const now = new Date();
    const nowTime = now.getTime()
    axios.get(process.env.SERVER_IP + `/sessions?server=${msg.guild.id}`).then(function (response) {
        let dndDay = Infinity;
        response.data.forEach(day => {
            if (nowTime < day.date) {
                if (day.date - nowTime < dndDay - nowTime) {
                    dndDay = day.date;
                }
            }
        });
        if (dndDay == Infinity) {
            msg.editReply(`There is currently no planned date for the next session!`)
            return
        }
        const difference = dndDay - nowTime;
        const days = Math.floor((difference / (1000 * 60 * 60 * 24)) % 365)
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
        const minutes = Math.floor((difference / (1000 * 60)) % 60)
        let diff = new Date(dndDay).getDay() - new Date(nowTime).getDay()
        if (diff < 0) {
            diff += 7;
        }
        if (days > 3) {
            msg.editReply(`DnD is in ${days} days, ${hours} hours and ${minutes} minutes!`)
            return;
        }
        switch (diff) {
            case 0:
                if (difference <= 0) {
                    msg.editReply(`DND IS NOW, WHAT ARE YOU WAITING FOR GO PLAY!`)
                } else {
                    msg.editReply(`OMG OMG OMG AAAAAAAAAAH DND IS TODAY!\nONLY ${hours} HOURS AND ${minutes} MINUTES REMAINING!`)
                }
                msg.editReply(`WEEEEEEEEEEEEEEEEEEEEEEEEEEEE`)
                break;
            case 1:
                msg.editReply(`OMG DND IS TOMORROW!\nITS IN ONLY ${hours + 24 * days} HOURS AND ${minutes} MINUTES!`);
                msg.followUp(`AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH`)
                break;
            default:
                msg.editReply(`DnD is in ${days} days, ${hours} hours and ${minutes} minutes!`)
                break;
        }
    })
}
export const Command = {info:data,command:execute}