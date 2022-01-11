import registerSlashCommands from "./registerSlashCommands";
import dotenv from "dotenv";
import { Client, Intents, TextChannel } from 'discord.js'

import { Commands } from "./commands";
import interfaceCommands, {Play} from "./interfaceCommands"

dotenv.config()

export const client:Client = new Client({ intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES] });

let secretMessageInfo: {channelId: string, guildId: string};
let secretMessageChannel: TextChannel;
let secretMessageMode = false;

client.on('ready',async () => {
    if(process.env.REGISTER_COMMANDS === '1') {
        const servers = client.guilds.cache.map(guild => guild.id)
        await registerSlashCommands(servers)
    }
})

client.on('messageCreate', async (message) => {
    if(process.env.SECRET_MESSAGE !== '1') {
        return;
    }
    if(message.author.id !== process.env.SECRET_ID) {
        return;
    }
    if(message.content === '::setChannel') {
        console.log('channel set');
        const channel = await (await client.guilds.cache.get(message.guildId)).channels.cache.get(message.channelId)
        if(!process.env.SECRET_ID ||channel.constructor.name === 'TextChannel') {
            secretMessageChannel = channel as TextChannel;
            message.delete();
        }
    } else if(message.content === '::toggleMode') {
        secretMessageInfo = {guildId: message.guildId, channelId: message.channelId}
        secretMessageMode = !secretMessageMode;
        message.reply(secretMessageMode.toString());
    } else if(secretMessageMode) {
        if(secretMessageInfo && message.guildId === secretMessageInfo.guildId && message.channelId === secretMessageInfo.channelId) {
            if(secretMessageChannel) {
                secretMessageChannel.send(message.content);
            }
        }
    }
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
