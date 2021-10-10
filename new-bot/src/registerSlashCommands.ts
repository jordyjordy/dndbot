import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { RegisterCommands } from "./commands";

async function registerSlashCommands(servers:string[]):Promise<void> {
    const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);
    (async () => {
        try {
            console.log('Started refreshing application (/) commands.');
            for(let i = 0; i < servers.length; i++) {
                try{
                    await rest.put(
                        Routes.applicationGuildCommands(process.env.CLIENT_ID, servers[i]),
                        { body: RegisterCommands }
                    );
                } catch(err) {
                    console.error(err)
                }
            }
            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    })();
}
export default registerSlashCommands