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
exports.Command = void 0;
const connectionManager_1 = require("../connectionManager");
const builders_1 = require("@discordjs/builders");
const interface_1 = require("../utils/interface");
const messageReply_1 = require("../utils/messageReply");
const data = new builders_1.SlashCommandBuilder()
    .setName('disconnect')
    .setDescription('Clears a song (number) or all songs ("all") from the queue');
const execute = function (msg) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!msg.guildId) {
            return;
        }
        yield msg.deferReply();
        const connectionManager = yield (0, connectionManager_1.getConnectionContainer)(msg.guildId);
        yield (0, interface_1.updateInterface)(connectionManager);
        try {
            connectionManager.clearConnection();
            connectionManager.playing = false;
            yield (0, messageReply_1.reply)(msg, 'hm');
            yield (0, messageReply_1.deleteReply)(msg);
        }
        catch (err) {
            console.error(err);
        }
    });
};
exports.Command = { info: data, command: execute };
//# sourceMappingURL=disconnect.js.map