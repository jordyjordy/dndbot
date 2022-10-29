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
const loop_1 = require("../utils/loop");
const interface_1 = require("../utils/interface");
const data = new builders_1.SlashCommandBuilder()
    .setName('loop')
    .setDescription('Set looping kind (none, one, all)')
    .addSubcommand(command => command.setName('none').setDescription("stop all looping"))
    .addSubcommand(command => command.setName('all').setDescription("loop all"))
    .addSubcommand(command => command.setName('one').setDescription("loop one song"));
const execute = function (msg) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!msg.guildId) {
            return;
        }
        yield msg.deferReply();
        const connectionManager = yield (0, connectionManager_1.getConnectionContainer)(msg.guildId);
        const toggle = msg.options.getSubcommand();
        let option = loop_1.LoopEnum.NONE;
        switch (toggle) {
            case "one":
                option = loop_1.LoopEnum.ONE;
                break;
            case "all":
                option = loop_1.LoopEnum.ALL;
                break;
            default:
                option = loop_1.LoopEnum.NONE;
                break;
        }
        if (option !== loop_1.LoopEnum.NONE) {
            connectionManager.shuffle = false;
        }
        connectionManager.toggleLoop(option);
        (0, interface_1.updateInterface)(connectionManager, msg, false, false, true);
    });
};
exports.execute = execute;
exports.Command = { info: data, command: exports.execute };
//# sourceMappingURL=loop.js.map