import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { RegisterCommands } from "./commands";

async function registerSlashCommands(servers:string[]):Promise<void> {
    let commands = RegisterCommands;
    if(process.env.BOT_ID && Number(process.env.BOT_ID) > 1) {
        console.log('BOT ID bigger than 1')
        commands = RegisterCommands.map((command) => ({...command, name: `${command.name}${process.env.BOT_ID}`}));
    }
    const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);
    try {
        console.log('Started refreshing application (/) commands.');
        for(let i = 0; i < servers.length; i++) {
            await refreshSlashCommmands(servers[i], rest, commands);
        }
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
}

const refreshSlashCommmands = async (server: string, rest: REST, commands) => {
    try{
        // // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // const oldCommands: Array<any> | any = await rest.get(Routes.applicationGuildCommands(process.env.CLIENT_ID, server));
        // oldCommands.forEach(async (command) => {
        //     const deleteUrl: `/${string}` = `${Routes.applicationGuildCommands(process.env.CLIENT_ID, server)}/${command.id}`;
        //     try{ 
        //         await rest.delete(deleteUrl);
        //     } catch(err) {
        //         console.log('could not delete command')
        //         // do nothing
        //     }
        // })
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, server),
            { body: commands }
        );
    } catch(err) {
        console.error(err)
    }
}


export default registerSlashCommands