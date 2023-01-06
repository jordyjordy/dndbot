import { CommandInteraction, InteractionReplyOptions } from "discord.js/typings/index.js";

export async function reply(interaction:CommandInteraction,message: InteractionReplyOptions | string):Promise<void> {
    if(!interaction) return;
    if(interaction.replied || interaction.deferred) {
        if(typeof(message) !== 'string') message.ephemeral = false;
        await interaction.editReply(message);
    } else {
        await interaction.reply(message);
    }
}

export async function deleteReply(interaction:CommandInteraction):Promise<boolean> {
    if(!interaction) return false;
    try{
        if(interaction.replied) {
            await interaction.deleteReply();
            return true;
        }
        return false;
    } catch(err) {
        console.error(err);
        return false;
    }
}