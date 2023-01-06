import { getConnection } from "../connectionManager";
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from "discord.js";
import { LoopEnum } from "../utils/loop";
import { updateInterface } from "../utils/interface";
const data = new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Set looping kind (none, one, all)')
    .addSubcommand(command => command.setName('none').setDescription("stop all looping"))
    .addSubcommand(command => command.setName('all').setDescription("loop all"))
    .addSubcommand(command => command.setName('one').setDescription("loop one song"));

export const execute = async function(msg:CommandInteraction):Promise<void> {
    if(!msg.guildId) {
        return;
    }
    await msg.deferReply();
    const { connectionManager, queueManager } = await getConnection(msg.guildId);
    const toggle = msg.options.getSubcommand();
    let option = LoopEnum.NONE;
    switch(toggle) {
        case "one":
            option = LoopEnum.ONE;
            break;
        case "all":
            option = LoopEnum.ALL;
            break;
        default:
            option = LoopEnum.NONE;
            break;
    }
    if(option !== LoopEnum.NONE) {
        queueManager.shuffle = false;
    }
    queueManager.toggleLoop(option);
    updateInterface(connectionManager,msg,false,false,true);
};

export const Command = {info:data,command:execute};