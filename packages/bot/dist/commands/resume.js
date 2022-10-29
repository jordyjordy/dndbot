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
    .setName('resume')
    .setDescription('continue/start song playback');
const execute = function (msg) {
    return __awaiter(this, void 0, void 0, function* () {
        yield msg.deferReply();
        if (!msg.guildId) {
            return;
        }
        const connectionManager = yield (0, connectionManager_1.getConnectionContainer)(msg.guildId);
        try {
            if (!connectionManager.isConnected()) {
                if (!(yield connectionManager.connect(msg))) {
                    (0, messageReply_1.reply)(msg, "Something went wrong, Are you sure you are in a voice channel?");
                    return;
                }
            }
            yield connectionManager.play();
            (0, interface_1.updateInterface)(connectionManager, msg, false, false, true);
        }
        catch (err) {
            console.error(err);
        }
    });
};
exports.execute = execute;
exports.Command = { info: data, command: exports.execute };
//# sourceMappingURL=resume.js.map