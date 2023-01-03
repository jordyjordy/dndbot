import registerSlashCommands from "./registerSlashCommands";
import dotenv from "dotenv";
import { Client, Intents } from 'discord.js'

import { Commands } from "./commands";
import interfaceCommands from "./interfaceCommands"
import { getConnection } from "./connectionManager";

dotenv.config()

const client:Client = new Client({ intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES] });

client.on('ready',async () => {
    if(process.env.REGISTER_COMMANDS === '1') {
        const servers = client.guilds.cache.map(guild => guild.id)
        await registerSlashCommands(servers)
    }
    client.guilds.cache.forEach(guild => getConnection(guild.id))
})

client.on('interactionCreate', async interaction => {
    
    if(interaction.isCommand()) {
        try{
            Commands.forEach(command => {
                const cmdName = `${command.info.name}${(process.env.BOT_ID && Number(process.env.BOT_ID) > 1) ? process.env.BOT_ID : ''}`
                if(cmdName === interaction.commandName) {
                    command.command(interaction)
                }
            })
        } catch(err) {
            interaction.editReply("Something went wrong trying to process your command")
        }
    } else if (interaction.isMessageComponent()) {
        try{
            if(interfaceCommands[interaction.customId]) {
                interfaceCommands[interaction.customId].command(interaction)
            } else {
                interaction.channel?.send("something went wrong, could not perform action")
            }
        } catch(err) {
            console.error(err);
        }
    }
})

client.on('error', (err) => {
    console.error(err)
})

// client.on('guildCreate', async guild => {
//     registerSlashCommands([guild.id])
// })

export default client;

export { getConnection } 