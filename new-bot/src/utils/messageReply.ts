import { Message } from "discord.js";
import { CommandInteraction, InteractionReplyOptions } from "discord.js/typings/index.js";
import { APIMessage } from "../../node_modules/discord.js/node_modules/discord-api-types/v9";

export async function reply(interaction:CommandInteraction,message: InteractionReplyOptions | string):Promise<Message| APIMessage> {
    if(interaction.replied || interaction.deferred) {
        if(typeof(message) !== 'string') message.ephemeral = false
        await interaction.editReply(message)
    } else {
        await interaction.reply(message)
    }
    return interaction.fetchReply()
}

export async function deleteReply(interaction:CommandInteraction):Promise<boolean> {
    try{
        if(interaction.replied) {
            await interaction.deleteReply()
            return true
        } 
    } catch(err) {
        console.log(err)
        return false
    }
    
}