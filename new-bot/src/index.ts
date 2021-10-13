import registerSlashCommands from "./registerSlashCommands";
import dotenv from "dotenv";
import { Client, Intents } from 'discord.js'

import { Commands } from "./commands";
import interfaceCommands, {Play} from "./interfaceCommands"

dotenv.config()

export const client:Client = new Client({ intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_VOICE_STATES] });

client.on('ready',async () => {
    const servers = client.guilds.cache.map(guild => guild.id)
    registerSlashCommands(servers)
})

client.on('interactionCreate', async interaction => {
    
    if(interaction.isCommand()) {
        try{
            Commands.forEach(command => {
                if(command.info.name === interaction.commandName) {
                    command.command(interaction)
                }
            })
        } catch(err) {
            interaction.editReply("Something went wrong trying to process your command")
        }
    } else if(interaction.isSelectMenu()) {
        try{
            await Play.command(interaction)
        } catch(err) {
            console.error(err);
        }
    } else if (interaction.isMessageComponent()) {
        try{
            if(interfaceCommands[interaction.customId]) {
                interfaceCommands[interaction.customId].command(interaction)
            } else {
                interaction.channel.send("something went wrong, could not perform action")
            }
        } catch(err) {
            console.error(err);
        }
    }
})

client.on('error', (err) => {
    console.error(err)
})

client.on('guildCreate', async guild => {
    registerSlashCommands([guild.id])
})

client.login(process.env.BOT_TOKEN)
