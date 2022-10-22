import {Command as play} from "./play"
import {Command as playpause} from "./playpause"
import {Command as ps} from "./prevsong"
import {Command as ns } from './nextsong'
import {Command as stop} from "./stop"
import {Command as replay} from "./replay"
import {Command as loop} from "./loop"
import {Command as shuffle} from "./shuffle"
import {Command as reload} from "./reload"
import {Command as clear} from "./clear"
import {Command as setPlaylist} from './setPlaylist'

import { MessageComponentInteraction } from "discord.js";
export const Play = play


export type interfaceCommand = {
    info:{name:string},
    command:(msg:MessageComponentInteraction)=>Promise<void>
}
export type interfaceCommandList = {
    [key:string]:interfaceCommand
}

const commands:interfaceCommandList = {
    "play":play,
    "playpause":playpause,
    "ns":ns,
    "ps":ps,
    "stop":stop,
    "replay":replay,
    "loop":loop,
    "shuffle":shuffle,
    "reload":reload,
    "clear":clear,
    "playlistSelect": setPlaylist,
}

export default commands