"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterCommands = exports.Commands = void 0;
const dnd_1 = require("./dnd");
const info_1 = require("./info");
const passcode_1 = require("./passcode");
const roll_1 = require("./roll");
const play_1 = require("./play");
const addsong_1 = require("./addsong");
const clear_1 = require("./clear");
const queue_1 = require("./queue");
const pause_1 = require("./pause");
const loop_1 = require("./loop");
const nextsong_1 = require("./nextsong");
const prevsong_1 = require("./prevsong");
const replay_1 = require("./replay");
const disconnect_1 = require("./disconnect");
const resume_1 = require("./resume");
const shuffle_1 = require("./shuffle");
const createplaylist_1 = require("./createplaylist");
const deleteplaylist_1 = require("./deleteplaylist");
exports.Commands = [dnd_1.Command, info_1.Command, passcode_1.Command, roll_1.Command, play_1.Command, addsong_1.Command, clear_1.Command, queue_1.Command, pause_1.Command, loop_1.Command, nextsong_1.Command, prevsong_1.Command, replay_1.Command, disconnect_1.Command, resume_1.Command, shuffle_1.Command, createplaylist_1.Command,
    deleteplaylist_1.Command];
exports.RegisterCommands = exports.Commands.map(command => command.info.toJSON());
//# sourceMappingURL=index.js.map