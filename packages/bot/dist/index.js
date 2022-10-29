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
exports.getConnectionContainer = void 0;
const registerSlashCommands_1 = __importDefault(require("./registerSlashCommands"));
const dotenv_1 = __importDefault(require("dotenv"));
const discord_js_1 = require("discord.js");
const commands_1 = require("./commands");
const interfaceCommands_1 = __importDefault(require("./interfaceCommands"));
const connectionManager_1 = require("./connectionManager");
Object.defineProperty(exports, "getConnectionContainer", { enumerable: true, get: function () { return connectionManager_1.getConnectionContainer; } });
dotenv_1.default.config();
const client = new discord_js_1.Client({ intents: [discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.GUILD_VOICE_STATES, discord_js_1.Intents.FLAGS.GUILD_MESSAGES] });
client.on('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    if (process.env.REGISTER_COMMANDS === '1') {
        const servers = client.guilds.cache.map(guild => guild.id);
        yield (0, registerSlashCommands_1.default)(servers);
    }
    client.guilds.cache.forEach(guild => (0, connectionManager_1.getConnectionContainer)(guild.id));
}));
client.on('interactionCreate', (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (interaction.isCommand()) {
        try {
            commands_1.Commands.forEach(command => {
                const cmdName = `${command.info.name}${(process.env.BOT_ID && Number(process.env.BOT_ID) > 1) ? process.env.BOT_ID : ''}`;
                if (cmdName === interaction.commandName) {
                    command.command(interaction);
                }
            });
        }
        catch (err) {
            interaction.editReply("Something went wrong trying to process your command");
        }
    }
    else if (interaction.isMessageComponent()) {
        try {
            if (interfaceCommands_1.default[interaction.customId]) {
                interfaceCommands_1.default[interaction.customId].command(interaction);
            }
            else {
                (_a = interaction.channel) === null || _a === void 0 ? void 0 : _a.send("something went wrong, could not perform action");
            }
        }
        catch (err) {
            console.error(err);
        }
    }
}));
client.on('error', (err) => {
    console.error(err);
});
client.on('guildCreate', (guild) => __awaiter(void 0, void 0, void 0, function* () {
    (0, registerSlashCommands_1.default)([guild.id]);
}));
exports.default = client;
//# sourceMappingURL=index.js.map