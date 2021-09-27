import {getConnectionContainer} from "../connectionManager"
import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from "discord.js"

const data = new SlashCommandBuilder()
    .setName('disconnect')
    .setDescription('Clears a song (number) or all songs ("all") from the queue')

const execute = async function(msg:CommandInteraction):Promise<void> {
  const connectionManager = await getConnectionContainer(msg)
  try{
  connectionManager.clearConnection();
  await msg.editReply('huh')
  await msg.deleteReply()
  } catch(err) {
    console.log(err)
  }
}
export const Command = {info:data,command:execute}    
