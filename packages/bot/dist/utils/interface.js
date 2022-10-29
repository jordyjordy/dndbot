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
exports.getMessageContent = exports.updateInterface = void 0;
const voice_1 = require("@discordjs/voice");
const discord_js_1 = require("discord.js");
const loop_1 = require("./loop");
const messageReply_1 = require("../utils/messageReply");
function updateInterface(connectionContainer, msg, newmsg = false, removeOld = true, edit = false) {
    return __awaiter(this, void 0, void 0, function* () {
        if (connectionContainer.queueMessage && removeOld) {
            if (!connectionContainer.queueMessage.deleted) {
                try {
                    yield connectionContainer.queueMessage.delete();
                }
                catch (err) {
                    console.error(err);
                }
            }
            connectionContainer.queueMessage = undefined;
        }
        try {
            sendQueueMessage(connectionContainer, msg, getMessageContent(connectionContainer), newmsg, edit);
        }
        catch (err) {
            console.error(err);
        }
    });
}
exports.updateInterface = updateInterface;
function sendQueueMessage(connectionContainer, msg, message, newmsg, edit) {
    return __awaiter(this, void 0, void 0, function* () {
        let channel;
        if (!msg || !msg.channel) {
            if (!connectionContainer.queueMessage)
                return;
            channel = connectionContainer.queueMessage.channel;
            newmsg = true;
        }
        else {
            channel = msg.channel;
        }
        try {
            if (edit) {
                if (!newmsg && connectionContainer.queueMessage && msg) {
                    (0, messageReply_1.deleteReply)(msg);
                    connectionContainer.queueMessage.edit(message);
                }
                else if (msg) {
                    (0, messageReply_1.reply)(msg, message);
                }
                return;
            }
            if (newmsg) {
                connectionContainer.queueMessage = yield channel.send(message);
            }
            else if (msg) {
                yield (0, messageReply_1.reply)(msg, message);
                connectionContainer.queueMessage = (yield msg.fetchReply());
            }
        }
        catch (err) {
            console.error(err);
        }
    });
}
function getLoopIcon(connectionContainer) {
    if (connectionContainer.shuffle) {
        return ":twisted_rightwards_arrows:";
    }
    switch (connectionContainer.loop) {
        case loop_1.LoopEnum.ALL:
            return ':repeat:';
        case loop_1.LoopEnum.ONE:
            return ':repeat_one:';
        default:
            return ':blue_square:';
    }
}
function generateText(connectionContainer) {
    let response = "";
    response += "**Status: " + (connectionContainer.playing ? ':arrow_forward:' : ':pause_button:') +
        " PlayStyle: " + getLoopIcon(connectionContainer) + "**\n";
    return response;
}
function generatePlaylistSelectRow(connnectionContainer) {
    if (!connnectionContainer.playlists || connnectionContainer.playlists.length <= 0) {
        return new discord_js_1.MessageActionRow();
    }
    const placeholder = connnectionContainer.playlist + ': ' + connnectionContainer.playlists[connnectionContainer.playlist].name;
    const row = new discord_js_1.MessageActionRow().addComponents(new discord_js_1.MessageSelectMenu()
        .setCustomId('playlistSelect')
        .setPlaceholder(placeholder.substring(0, Math.min(80, placeholder.length)))
        .addOptions(connnectionContainer.playlists.map((el, id) => {
        const label = id + ": " + el.name.substring(0, Math.min(80, el.name.length));
        return { label, description: '', value: id.toString() };
    }).filter((el, id) => id < 25)));
    return row;
}
function generateSelectRow(connectionContainer) {
    if (connectionContainer.getCurrentQueue().length === 0) {
        return new discord_js_1.MessageActionRow();
    }
    let playingText = "PLAYING";
    if (connectionContainer.currentsong > connectionContainer.getCurrentQueue().length - 1) {
        return new discord_js_1.MessageActionRow();
    }
    if (!connectionContainer.playing) {
        if (!connectionContainer.audioPlayer) {
            playingText = "SELECTED";
        }
        else if (connectionContainer.audioPlayer.state.status === voice_1.AudioPlayerStatus.Paused
            || connectionContainer.audioPlayer.state.status === voice_1.AudioPlayerStatus.AutoPaused) {
            playingText = "PAUSED";
        }
        else {
            playingText = "SELECTED";
        }
    }
    if (connectionContainer.currentsongplaylist !== connectionContainer.playlist) {
        playingText = "";
    }
    const row = new discord_js_1.MessageActionRow()
        .addComponents(new discord_js_1.MessageSelectMenu()
        .setCustomId('play')
        .setPlaceholder(connectionContainer.currentsong + ": " + connectionContainer.getCurrentQueue()[connectionContainer.currentsong].name)
        .addOptions(connectionContainer.getCurrentQueue().map((el, id) => {
        const name = id + ": " + el.name.substring(0, Math.min(80, el.name.length));
        return { label: name, description: (connectionContainer.currentsong === id ? playingText : ""), value: id.toString() };
    }).filter((el, id) => id < 25)));
    return row;
}
function genererateButtonRow(connectionContainer) {
    const row = new discord_js_1.MessageActionRow()
        .addComponents(new discord_js_1.MessageButton()
        .setCustomId("playpause")
        .setLabel(getPlayButtonStyleAndText(connectionContainer).text)
        .setStyle(getPlayButtonStyleAndText(connectionContainer).style), new discord_js_1.MessageButton()
        .setCustomId("ps")
        .setLabel("Previous Song")
        .setStyle("SECONDARY"), new discord_js_1.MessageButton()
        .setCustomId("ns")
        .setLabel("Next Song")
        .setStyle("SECONDARY"), new discord_js_1.MessageButton()
        .setCustomId("stop")
        .setLabel("Stop")
        .setStyle("DANGER"));
    return row;
}
function generateSecondaryButtonRow(connectionContainer) {
    const row = new discord_js_1.MessageActionRow()
        .addComponents(new discord_js_1.MessageButton()
        .setCustomId("replay")
        .setLabel('Replay')
        .setStyle("SECONDARY"), new discord_js_1.MessageButton()
        .setCustomId("loop")
        .setLabel('Loop')
        .setStyle(getLoopButtonStyle(connectionContainer)), new discord_js_1.MessageButton()
        .setCustomId("shuffle")
        .setLabel('Shuffle')
        .setStyle(getShuffleButtonStyle(connectionContainer)), new discord_js_1.MessageButton()
        .setCustomId("reload")
        .setLabel('Reload Interface')
        .setStyle("PRIMARY"));
    return row;
}
function generateTeriaryButtonRow() {
    const row = new discord_js_1.MessageActionRow()
        .addComponents(new discord_js_1.MessageButton()
        .setCustomId('clear')
        .setLabel("Empty Playlist")
        .setStyle("DANGER"));
    return row;
}
function getLoopButtonStyle(connectionContainer) {
    switch (connectionContainer.loop) {
        case loop_1.LoopEnum.ALL:
            return "PRIMARY";
        case loop_1.LoopEnum.ONE:
            return "SUCCESS";
        default:
            return "SECONDARY";
    }
}
function getShuffleButtonStyle(connectionContainer) {
    if (connectionContainer.shuffle) {
        return "PRIMARY";
    }
    return "SECONDARY";
}
function getPlayButtonStyleAndText(connectionContainer) {
    if (connectionContainer.playing) {
        return { text: "Pause", style: "PRIMARY" };
    }
    return { text: "Play", style: "SUCCESS" };
}
function getMessageContent(connectionContainer) {
    const response = generateText(connectionContainer);
    const playlistRow = generatePlaylistSelectRow(connectionContainer);
    const selectrow = generateSelectRow(connectionContainer);
    const components = [];
    if (playlistRow) {
        components.push(playlistRow);
    }
    if (selectrow !== null) {
        components.push(selectrow);
    }
    components.push(genererateButtonRow(connectionContainer));
    components.push(generateSecondaryButtonRow(connectionContainer));
    components.push(generateTeriaryButtonRow());
    return { content: response, components: components };
}
exports.getMessageContent = getMessageContent;
//# sourceMappingURL=interface.js.map