import {getConnectionContainer} from "../connectionManager"
import { SelectMenuInteraction } from "discord.js"
import { getMessageContent } from "../utils/interface"
import { interfaceCommand } from "."
const data = {
    name:'play',
}

export const execute = async function(msg:SelectMenuInteraction):Promise<void> {
    const args = msg.values[0]
    const connectionManager = await getConnectionContainer(msg.guildId)

    try{
        if(!connectionManager.isConnected()) {
            await connectionManager.connect(msg)
        }
        await connectionManager.playSong(args).catch((err) => {
            console.error("COULD NOT UPDATE SONG FROM SELECT MENU?!")
        }).finally(() => {
            msg.update(getMessageContent(connectionManager))
        })
    } catch(err) {
        console.error("COULD CONNECT FROM SELECT MENU?!")
        console.error(err)
    }
}

export const Command:interfaceCommand = {info:data,command:execute}