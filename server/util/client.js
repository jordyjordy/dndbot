import pkg from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const { Client, GatewayIntentBits: Intents  } = pkg;
console.log(Intents);
const client = new Client({ intents: [Intents.Guilds,Intents.GuildVoiceStates, Intents.GuildMessages, Intents.GuildMembers] });

client.login(process.env.BOT_TOKEN);

export default client;
