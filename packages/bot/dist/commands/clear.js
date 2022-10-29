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
    .setName('clear')
    .setDescription('Clears a song (number) or all songs ("all") from the queue')
    .addSubcommand(command => command.setName('all').setDescription('clear the whole playlist'))
    .addSubcommand(command => command.setName('song').setDescription('remove a song from the playlist')
    .addStringOption(option => option.setName('index').setDescription("index of song to remove")));
const execute = function (msg) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!msg.guildId) {
            return;
        }
        yield msg.deferReply();
        const args = msg.options.getSubcommand();
        const connectionManager = yield (0, connectionManager_1.getConnectionContainer)(msg.guildId);
        try {
            if (args === "all") {
                if (!connectionManager.clearQueue()) {
                    (0, messageReply_1.reply)(msg, "Something went wrong clearing the queue");
                }
            }
            else if (args) {
                const val = msg.options.getString('index');
                if (val && !connectionManager.removeSong(val)) {
                    (0, messageReply_1.reply)(msg, "The song you are trying to remove is currently being played, or does not exist!");
                }
                else {
                    (0, messageReply_1.reply)(msg, "Song cleared");
                }
            }
            (0, interface_1.updateInterface)(connectionManager, msg, false, false, true);
        }
        catch (err) {
            console.error(err);
        }
    });
};
exports.execute = execute;
exports.Command = { info: data, command: exports.execute };
//# sourceMappingURL=clear.js.map