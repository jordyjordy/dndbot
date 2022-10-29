"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = exports.execute = void 0;
const axios_1 = __importDefault(require("axios"));
const builders_1 = require("@discordjs/builders");
const messageReply_1 = require("../utils/messageReply");
const data = new builders_1.SlashCommandBuilder()
    .setName('passcode')
    .setDescription('Request a passcode to be able to edit the database');
const execute = function (msg) {
    if (!msg.guildId || !msg.member || !msg.guild) {
        return;
    }
    axios_1.default.get(process.env.SERVER_IP + `/token?user=${msg.member.user.username}&server=${msg.guild.id}`).then(function (response) {
        (0, messageReply_1.reply)(msg, { content: "Your private code is: `" + response.data.result + "`. It's valid for 3 hours!", ephemeral: true });
    }).catch((err) => {
        console.error(err);
    });
};
exports.execute = execute;
exports.Command = { info: data, command: exports.execute };
//# sourceMappingURL=passcode.js.map