
import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js';
import { reply } from '../utils/messageReply';
import Session from '../../model/session';
const data = new SlashCommandBuilder()
    .setName('dnd')
    .setDescription('Gives time until the next session!')

const execute = async function(msg:CommandInteraction):Promise<void> {
    if(!msg.guild) {
        return;
    }
    await msg.deferReply();
    const now = new Date();
    const nowTime = now.getTime()
    const result = await Session.find({server: msg.guild.id })
    let dndDay = Infinity;
    result.forEach((day:{ date:number }) => {
        if (nowTime < day.date) {
            if (day.date - nowTime < dndDay - nowTime) {
                dndDay = day.date;
            }
        }
    });
    if (dndDay == Infinity) {
        await reply(msg, `There is currently no planned date for the next session!`)
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
        reply(msg, `DnD is in ${days} days, ${hours} hours and ${minutes} minutes!`)
        return;
    }
    switch (diff) {
        case 0:
            if (difference <= 0) {
                await reply(msg, `DND IS NOW, WHAT ARE YOU WAITING FOR GO PLAY!`)
            } else {
                await reply(msg, `OMG OMG OMG AAAAAAAAAAH DND IS TODAY!\nONLY ${hours} HOURS AND ${minutes} MINUTES REMAINING!`)
            }
            await msg.followUp(`WEEEEEEEEEEEEEEEEEEEEEEEEEEEE`)
            break;
        case 1:
            await reply(msg, `OMG DND IS TOMORROW!\nITS IN ONLY ${hours + 24 * days} HOURS AND ${minutes} MINUTES!`);
            await msg.followUp(`AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH`)
            break;
        default:
            await reply(msg, `DnD is in ${days} days, ${hours} hours and ${minutes} minutes!`)
            break;
    }
}
export const Command = {info:data,command:execute}