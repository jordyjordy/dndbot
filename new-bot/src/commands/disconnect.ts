import {getConnectionContainer} from "../connectionManager"
import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from "discord.js"
import { updateInterface } from "../utils/interface"
import { reply, deleteReply } from "../utils/messageReply"

const data = new SlashCommandBuilder()
    .setName('disconnect')
    .setDescription('Clears a song (number) or all songs ("all") from the queue')

const execute = async function(msg:CommandInteraction):Promise<void> {
  await msg.deferReply();
  const connectionManager = await getConnectionContainer(msg)
  await updateInterface(connectionManager)
  try{
  connectionManager.clearConnection();
  connectionManager.playing = false
  await reply(msg, 'hm')
  await deleteReply(msg)
  } catch(err) {
    console.error(err)
  }
}
export const Command = {info:data,command:execute}    
