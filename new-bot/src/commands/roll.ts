import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { reply } from '../utils/messageReply'

const data = new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Roll dice in the discord chat')
    .addStringOption(option => option.setName('dice').setDescription('Specify what to roll'))

export const execute = async function(msg:CommandInteraction):Promise<void> {
    await msg.deferReply();
    const args = Array.from(msg.options.data.values()).map(entry => entry.value.toString())
    const str = args[0]
    const split = str.split(/\s|d|\+|-/)
    let multiplier = 0;
    try {
        if (str.includes('+')) {
            multiplier += 1
        } if (str.includes('-')) {
            multiplier -= 1
        }
    } catch (err) {
        console.error(err)
    }
    try {
        const results = []
        const dicecount = parseInt(split[0])
        const dicefaces = parseInt(split[1])
        let bonus = parseInt(split[2]) * multiplier
        for (let i = 0; i < dicecount; i++) {
            const roll = Math.ceil(Math.random() * dicefaces)
            results.push(roll)
        }
        
        let resultString = "```csharp\n#" + str + ":\n"
        if (isNaN(bonus)) {
            bonus = 0
        }
        const highest = Math.max(...results) + bonus
        const lowest = Math.min(...results) + bonus
        const sum = results.reduce(sumFunc) + bonus
        if (results.length > 1) {
            resultString +=
                "highest:" + highest + " (" + (highest - bonus) + (bonus >= 0 ? "+" : "") + bonus + ")" + "\n" +
                "lowest:" + lowest + " (" + (lowest - bonus) + (bonus >= 0 ? "+" : "") + bonus + ")" + "\n" +
                "sum:" + sum + " ("
            results.forEach(x => { resultString += x + "+" })
            resultString = resultString.substring(0, resultString.length - 1)
            resultString += ')' + (bonus >= 0 ? "+" : "") + bonus + '```'

        } else {
            resultString += "result:" + highest + " (" + (highest - bonus) + (bonus >= 0 ? "+" : "") + bonus + ")" + "```"
        }
        reply(msg, {content:resultString, ephemeral:true })
    } catch(err) {
        msg.reply("Make sure to use the correct argument")
    }
}

function sumFunc(total, num) {
    return total + num;
}

export const Command = {info:data,command:execute}