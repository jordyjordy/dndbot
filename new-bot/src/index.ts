import registerSlashCommands from "./registerSlashCommands";
import dotenv from "dotenv";
dotenv.config()
import { Client, Intents } from 'discord.js'
export const client:Client = new Client({ intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_VOICE_STATES] });
import { Commands } from "./commands";
client.on('ready',async () => {
    console.log('ready')
    const servers = client.guilds.cache.map(guild => guild.id)
    if(process.env.REGISTER_COMMANDS && parseInt(process.env.REGISTER_COMMANDS) !== 0) {
        registerSlashCommands(servers)
    }
})

client.on('interactionCreate', async interaction => {
    if(!interaction.isCommand()) {
        return
    }
    await interaction.deferReply();
    Commands.forEach(command => {
        if(command.info.name === interaction.commandName) {
            command.command(interaction)
        }
    })
})

client.login(process.env.TOKEN)
