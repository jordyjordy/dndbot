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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = exports.execute = void 0;
const axios_1 = __importDefault(require("axios"));
const builders_1 = require("@discordjs/builders");
const messageReply_1 = require("../utils/messageReply");
const data = new builders_1.SlashCommandBuilder()
    .setName('info')
    .setDescription('Provides info about characters!')
    .addStringOption(option => option.setName('query').setDescription('Enter a name or part of a name'));
const execute = function (msg) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!msg.guildId || !msg.guild) {
            return;
        }
        yield msg.deferReply();
        const args = Array.from(msg.options.data.values()).map(entry => { var _a, _b; return (_b = (_a = entry.value) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : ''; });
        if (args.length == 0) {
            (0, messageReply_1.reply)(msg, "Please specify what you want information about, for example type `?info Villads`");
            return;
        }
        let query = "";
        for (let i = 0; i < args.length; i++) {
            query += args[i];
            if (i < args.length - 1) {
                query += " ";
            }
        }
        try {
            axios_1.default.get(process.env.SERVER_IP + `/item/name?name=${query}&server=${msg.guild.id}`).then(function (response) {
                if (response.data.length > 0) {
                    let resultString = ``;
                    for (let i = 0; i < response.data.length; i++) {
                        resultString += `**Name:** ${response.data[i].name} **Type:** ${response.data[i].type} \n \n${response.data[i].details}\n`;
                        if (i + 1 < response.data.length) {
                            resultString += "----------------------------------------\n";
                        }
                    }
                    (0, messageReply_1.reply)(msg, resultString);
                }
                else {
                    (0, messageReply_1.reply)(msg, "No information was found with that name");
                }
            });
        }
        catch (err) {
            console.error(err);
        }
    });
};
exports.execute = execute;
exports.Command = { info: data, command: exports.execute };
//# sourceMappingURL=info.js.map