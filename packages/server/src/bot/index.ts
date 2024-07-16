import dotenv from "dotenv";
import { Client, Intents } from 'discord.js';

import { getConnection } from "./connectionManager";

dotenv.config();

const client:Client = new Client({ intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES] });

client.on('ready',async () => {
    client.guilds.cache.forEach(guild => getConnection(guild.id));
});

client.on('error', (err) => {
    console.error(err);
});

// client.on('guildCreate', async guild => {
//     registerSlashCommands([guild.id])
// })

export default client;

export { getConnection }; 