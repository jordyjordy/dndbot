"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Play = void 0;
const play_1 = require("./play");
const playpause_1 = require("./playpause");
const prevsong_1 = require("./prevsong");
const nextsong_1 = require("./nextsong");
const stop_1 = require("./stop");
const replay_1 = require("./replay");
const loop_1 = require("./loop");
const shuffle_1 = require("./shuffle");
const reload_1 = require("./reload");
const clear_1 = require("./clear");
const setPlaylist_1 = require("./setPlaylist");
exports.Play = play_1.Command;
const commands = {
    "play": play_1.Command,
    "playpause": playpause_1.Command,
    "ns": nextsong_1.Command,
    "ps": prevsong_1.Command,
    "stop": stop_1.Command,
    "replay": replay_1.Command,
    "loop": loop_1.Command,
    "shuffle": shuffle_1.Command,
    "reload": reload_1.Command,
    "clear": clear_1.Command,
    "playlistSelect": setPlaylist_1.Command,
};
exports.default = commands;
//# sourceMappingURL=index.js.map