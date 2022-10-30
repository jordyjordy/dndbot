import {Command as dnd} from "./dnd"
import {Command as info} from './info'
import {Command as passcode} from './passcode'
import {Command as roll} from './roll'
import {Command as play} from './play'
import {Command as addsong} from './addsong'
import {Command as clear} from './clear'
import {Command as queue} from './queue'
import {Command as pause} from'./pause'
import {Command as loop} from './loop'
import {Command as nextsong} from './nextsong'
import {Command as prevsong} from './prevsong'
import {Command as replay} from './replay'
import {Command as disconnect} from './disconnect'
import {Command as resume} from "./resume"
import {Command as shuffle} from "./shuffle"
import {Command as createplaylist} from "./createplaylist"
import {Command as deleteplaylist} from "./deleteplaylist"

export const Commands = [dnd,info,passcode,roll,play,addsong,clear,queue,pause,loop,nextsong,prevsong,replay,disconnect,resume, shuffle, createplaylist,
    deleteplaylist]

export const RegisterCommands: any[] = Commands.map(command => command.info.toJSON())