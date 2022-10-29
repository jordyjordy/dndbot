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
exports.Command = void 0;
const axios_1 = __importDefault(require("axios"));
const builders_1 = require("@discordjs/builders");
const messageReply_1 = require("../utils/messageReply");
const data = new builders_1.SlashCommandBuilder()
    .setName('dnd')
    .setDescription('Gives time until the next session!');
const execute = function (msg) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!msg.guild) {
            return;
        }
        yield msg.deferReply();
        const now = new Date();
        const nowTime = now.getTime();
        axios_1.default.get(process.env.SERVER_IP + `/sessions?server=${msg.guild.id}`).then(function (response) {
            return __awaiter(this, void 0, void 0, function* () {
                let dndDay = Infinity;
                response.data.forEach((day) => {
                    if (nowTime < day.date) {
                        if (day.date - nowTime < dndDay - nowTime) {
                            dndDay = day.date;
                        }
                    }
                });
                if (dndDay == Infinity) {
                    yield (0, messageReply_1.reply)(msg, `There is currently no planned date for the next session!`);
                    return;
                }
                const difference = dndDay - nowTime;
                const days = Math.floor((difference / (1000 * 60 * 60 * 24)) % 365);
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / (1000 * 60)) % 60);
                let diff = new Date(dndDay).getDay() - new Date(nowTime).getDay();
                if (diff < 0) {
                    diff += 7;
                }
                if (days > 3) {
                    (0, messageReply_1.reply)(msg, `DnD is in ${days} days, ${hours} hours and ${minutes} minutes!`);
                    return;
                }
                switch (diff) {
                    case 0:
                        if (difference <= 0) {
                            yield (0, messageReply_1.reply)(msg, `DND IS NOW, WHAT ARE YOU WAITING FOR GO PLAY!`);
                        }
                        else {
                            yield (0, messageReply_1.reply)(msg, `OMG OMG OMG AAAAAAAAAAH DND IS TODAY!\nONLY ${hours} HOURS AND ${minutes} MINUTES REMAINING!`);
                        }
                        yield msg.followUp(`WEEEEEEEEEEEEEEEEEEEEEEEEEEEE`);
                        break;
                    case 1:
                        yield (0, messageReply_1.reply)(msg, `OMG DND IS TOMORROW!\nITS IN ONLY ${hours + 24 * days} HOURS AND ${minutes} MINUTES!`);
                        yield msg.followUp(`AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH`);
                        break;
                    default:
                        yield (0, messageReply_1.reply)(msg, `DnD is in ${days} days, ${hours} hours and ${minutes} minutes!`);
                        break;
                }
            });
        });
    });
};
exports.Command = { info: data, command: execute };
//# sourceMappingURL=dnd.js.map