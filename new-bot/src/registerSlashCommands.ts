import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { RegisterCommands } from "./commands";

async function registerSlashCommands(servers:string[]):Promise<void> {
    let commands = RegisterCommands;
    if(process.env.BOT_ID && Number(process.env.BOT_ID) > 1) {
        commands = RegisterCommands.map((command) => ({...command, name: `${command.name}${process.env.BOT_ID}`}));
    }
    const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);
    try {
        const promises = [];
        console.log('Started refreshing application (/) commands.');
        for(let i = 0; i < servers.length; i++) {
            promises.push(refreshSlashCommmands(servers[i], rest, commands))
        }
        await Promise.allSettled(promises);
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
}

const refreshSlashCommmands = async (server: string, rest: REST, commands) => {
    try{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const oldCommands: Array<any> | any = await rest.get(Routes.applicationGuildCommands(process.env.CLIENT_ID, server));
        console.log(oldCommands);
        const promises = [];
        oldCommands.forEach(command => {
            const deleteUrl: `/${string}` = `${Routes.applicationGuildCommands(process.env.CLIENT_ID, server)}/${command.id}`;
            promises.push(rest.delete(deleteUrl));
        })
        await Promise.allSettled(promises);
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, server),
            { body: commands }
        );
        console.log('yay');
    } catch(err) {
        console.error(err)
    }
}


export default registerSlashCommands