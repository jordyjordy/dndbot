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

export const Commands = [dnd,info,passcode,roll,play,addsong,clear,queue,pause,loop,nextsong,prevsong,replay,disconnect,resume]

export const RegisterCommands = Commands.map(command => command.info.toJSON())