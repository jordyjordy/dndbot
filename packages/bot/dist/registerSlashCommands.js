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
const rest_1 = require("@discordjs/rest");
const v9_1 = require("discord-api-types/v9");
const commands_1 = require("./commands");
function registerSlashCommands(servers) {
    return __awaiter(this, void 0, void 0, function* () {
        let commands = commands_1.RegisterCommands;
        if (process.env.BOT_ID && Number(process.env.BOT_ID) > 1) {
            commands = commands_1.RegisterCommands.map((command) => (Object.assign(Object.assign({}, command), { name: `${command.name}${process.env.BOT_ID}` })));
        }
        const rest = new rest_1.REST({ version: '9' }).setToken(process.env.BOT_TOKEN);
        try {
            console.log('Started refreshing application (/) commands.');
            for (let i = 0; i < servers.length; i++) {
                yield refreshSlashCommmands(servers[i], rest, commands);
            }
            console.log('Successfully reloaded application (/) commands.');
        }
        catch (error) {
            console.error(error);
        }
    });
}
const refreshSlashCommmands = (server, rest, commands) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield rest.put(v9_1.Routes.applicationGuildCommands(process.env.CLIENT_ID, server), { body: commands });
    }
    catch (err) {
        console.error(err);
    }
});
exports.default = registerSlashCommands;
//# sourceMappingURL=registerSlashCommands.js.map