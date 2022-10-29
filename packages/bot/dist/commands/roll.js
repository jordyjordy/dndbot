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
const builders_1 = require("@discordjs/builders");
const messageReply_1 = require("../utils/messageReply");
const data = new builders_1.SlashCommandBuilder()
    .setName('roll')
    .setDescription('Roll dice in the discord chat')
    .addStringOption(option => option.setName('dice').setDescription('Specify what to roll'));
const execute = function (msg) {
    return __awaiter(this, void 0, void 0, function* () {
        const args = Array.from(msg.options.data.values()).map(entry => { var _a, _b; return (_b = (_a = entry.value) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : ''; });
        const str = args[0];
        const split = str.split(/\s|d|\+|-/);
        let multiplier = 0;
        try {
            if (str.includes('+')) {
                multiplier += 1;
            }
            if (str.includes('-')) {
                multiplier -= 1;
            }
        }
        catch (err) {
            console.error(err);
        }
        try {
            const results = [];
            const dicecount = parseInt(split[0]);
            const dicefaces = parseInt(split[1]);
            let bonus = parseInt(split[2]) * multiplier;
            for (let i = 0; i < dicecount; i++) {
                const roll = Math.ceil(Math.random() * dicefaces);
                results.push(roll);
            }
            let resultString = "```csharp\n#" + str + ":\n";
            if (isNaN(bonus)) {
                bonus = 0;
            }
            const highest = Math.max(...results) + bonus;
            const lowest = Math.min(...results) + bonus;
            const sum = results.reduce(sumFunc) + bonus;
            if (results.length > 1) {
                resultString +=
                    "highest:" + highest + " (" + (highest - bonus) + (bonus >= 0 ? "+" : "") + bonus + ")" + "\n" +
                        "lowest:" + lowest + " (" + (lowest - bonus) + (bonus >= 0 ? "+" : "") + bonus + ")" + "\n" +
                        "sum:" + sum + " (";
                results.forEach(x => { resultString += x + "+"; });
                resultString = resultString.substring(0, resultString.length - 1);
                resultString += ')' + (bonus >= 0 ? "+" : "") + bonus + '```';
            }
            else {
                resultString += "result:" + highest + " (" + (highest - bonus) + (bonus >= 0 ? "+" : "") + bonus + ")" + "```";
            }
            (0, messageReply_1.reply)(msg, { content: resultString, ephemeral: true });
        }
        catch (err) {
            (0, messageReply_1.reply)(msg, "Make sure to use the correct argument");
        }
    });
};
exports.execute = execute;
function sumFunc(total, num) {
    return total + num;
}
exports.Command = { info: data, command: exports.execute };
//# sourceMappingURL=roll.js.map