"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = exports.execute = void 0;
const connectionManager_1 = require("../connectionManager");
const builders_1 = require("@discordjs/builders");
const interface_1 = require("../utils/interface");
const messageReply_1 = require("../utils/messageReply");
const data = new builders_1.SlashCommandBuilder()
    .setName('play')
    .setDescription('Join audio channel and start playing a song')
    .addStringOption(option => option.setName('song').setDescription('Enter a youtube url or queue index'));
const execute = function (msg) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!msg.guildId) {
            return;
        }
        yield msg.deferReply();
        const args = Array.from(msg.options.data.values()).map(entry => { var _a, _b; return (_b = (_a = entry.value) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : ''; });
        const connectionManager = yield (0, connectionManager_1.getConnectionContainer)(msg.guildId);
        try {
            if (!connectionManager.isConnected()) {
                const connect = yield connectionManager.connect(msg);
                if (!connect) {
                    (0, messageReply_1.reply)(msg, "Something went wrong, Are you sure you are in a voice channel?");
                    return;
                }
            }
            if (args.length == 0) {
                if (!connectionManager.play()) {
                    (0, messageReply_1.reply)(msg, "Can not play a song, are you sure there is something in the queue?");
                }
                else {
                    (0, interface_1.updateInterface)(connectionManager, msg);
                }
                return;
            }
            yield connectionManager.playSong(args[0]).then(() => {
                (0, messageReply_1.reply)(msg, "You are playing: " + args[0]);
                (0, interface_1.updateInterface)(connectionManager, msg, true);
            }).catch((err) => {
                (0, messageReply_1.reply)(msg, `something went wrong: ${err.message}`);
            });
        }
        catch (err) {
            console.error(err);
        }
    });
};
exports.execute = execute;
exports.Command = { info: data, command: exports.execute };
//# sourceMappingURL=play.js.map