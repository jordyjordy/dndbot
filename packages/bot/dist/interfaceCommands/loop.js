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
const interface_1 = require("../utils/interface");
const loop_1 = require("../utils/loop");
const data = {
    name: 'loop',
};
const execute = function (msg) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!msg.guildId) {
            return;
        }
        const connectionManager = yield (0, connectionManager_1.getConnectionContainer)(msg.guildId);
        let option = connectionManager.loop;
        switch (option) {
            case loop_1.LoopEnum.ONE:
                option = loop_1.LoopEnum.NONE;
                break;
            case loop_1.LoopEnum.NONE:
                option = loop_1.LoopEnum.ALL;
                break;
            default:
                option = loop_1.LoopEnum.ONE;
                break;
        }
        connectionManager.shuffle = false;
        connectionManager.toggleLoop(option);
        try {
            msg.update((0, interface_1.getMessageContent)(connectionManager));
        }
        catch (err) {
            console.error(err);
        }
    });
};
exports.execute = execute;
exports.Command = { info: data, command: exports.execute };
//# sourceMappingURL=loop.js.map