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
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _ConnectionContainer_instances, _ConnectionContainer_setPlaylists, _ConnectionContainer_updateQueue, _ConnectionContainer_startSong, _ConnectionContainer_prepareAudioPlayer;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionContainer = exports.destroyConnectionContainer = exports.getConnectionContainer = void 0;
const voice_1 = require("@discordjs/voice");
const discord_js_1 = require("discord.js");
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const loop_1 = require("./utils/loop");
const _1 = __importDefault(require("."));
const interface_1 = require("./utils/interface");
const axios_1 = __importDefault(require("axios"));
const lodash_1 = require("lodash");
// import youtubedl from 'youtube-dl-exec'
const connectionContainers = {};
const MAX_PLAYLIST_SIZE = 24;
function getConnectionContainer(server) {
    return __awaiter(this, void 0, void 0, function* () {
        if (connectionContainers[server]) {
            return connectionContainers[server];
        }
        const container = new ConnectionContainer(server);
        yield container.configurePlaylists();
        connectionContainers[server] = container;
        return container;
    });
}
exports.getConnectionContainer = getConnectionContainer;
function destroyConnectionContainer(server) {
    return __awaiter(this, void 0, void 0, function* () {
        if (connectionContainers[server]) {
            try {
                connectionContainers[server].clearConnection();
                delete connectionContainers[server];
                return true;
            }
            catch (err) {
                return false;
            }
        }
        return true;
    });
}
exports.destroyConnectionContainer = destroyConnectionContainer;
class ConnectionContainer {
    constructor(server) {
        _ConnectionContainer_instances.add(this);
        this.configurePlaylists = () => __awaiter(this, void 0, void 0, function* () {
            yield __classPrivateFieldGet(this, _ConnectionContainer_setPlaylists, "f").call(this);
            return;
        });
        _ConnectionContainer_setPlaylists.set(this, () => {
            return axios_1.default.get(`${process.env.SERVER_IP}/playlists/list?server=${this.server}`).then(response => {
                var _a;
                if ((0, lodash_1.isEmpty)(response.data)) {
                    axios_1.default.post(`${process.env.SERVER_IP}/playlists`, { name: 'default', server: this.server });
                }
                else {
                    this.playlists = response.data;
                    this.playlists[this.playlist].queue = (_a = [...response.data[0].queue]) !== null && _a !== void 0 ? _a : [];
                }
                return;
            });
        });
        this.updatePlaylists = () => __awaiter(this, void 0, void 0, function* () {
            return axios_1.default.get(`${process.env.SERVER_IP}/playlists/list?server=${this.server}`).then(response => {
                this.playlists = response.data;
            });
        });
        this.createPlaylist = (name) => __awaiter(this, void 0, void 0, function* () {
            return axios_1.default.post(`${process.env.SERVER_IP}/playlists`, { name: name, server: this.server }).then((res) => {
                this.playlists.push(res.data.playlist);
                return true;
            }).catch(() => false);
        });
        this.deletePlaylist = (id) => __awaiter(this, void 0, void 0, function* () {
            if (id === this.playlist) {
                return false;
            }
            return axios_1.default.delete(`${process.env.SERVER_IP}/playlists?id=${this.playlists[id]._id}`).then(() => {
                this.playlists.splice(id, 1);
                if (this.playlist >= this.playlists.length) {
                    this.playlist -= 1;
                    this.currentsong = 0;
                    if (this.audioPlayer) {
                        this.audioPlayer.stop();
                    }
                }
                return true;
            }).catch(() => false);
        });
        this.renamePlaylist = (playlist, name) => __awaiter(this, void 0, void 0, function* () {
            this.playlists[playlist].name = name;
            return axios_1.default.put(`${process.env.SERVER_IP}/playlists`, { playlist: this.playlists[playlist] }).then(() => true).catch(() => false);
        });
        _ConnectionContainer_updateQueue.set(this, () => {
            axios_1.default.put(`${process.env.SERVER_IP}/playlists`, { playlist: this.playlists[this.playlist] });
        });
        this.getCurrentQueue = () => {
            var _a, _b;
            return (_b = (_a = this.playlists[this.playlist]) === null || _a === void 0 ? void 0 : _a.queue) !== null && _b !== void 0 ? _b : [];
        };
        this.server = server;
        this.loop = loop_1.LoopEnum.NONE;
        this.playlist = 0;
        this.playlists = [];
        this.currentsong = 0;
        this.currentsongplaylist = 0;
        this.playing = false;
        this.shuffle = false;
        this.crashed = false;
    }
    isConnected() {
        return !!(this.connection && this.connection.state.status !== voice_1.VoiceConnectionStatus.Disconnected);
    }
    connectToChannel(channelId, guildId) {
        return __awaiter(this, void 0, void 0, function* () {
            const guild = _1.default.guilds.cache.get(guildId);
            this.connection = (0, voice_1.joinVoiceChannel)({
                channelId,
                guildId,
                adapterCreator: guild === null || guild === void 0 ? void 0 : guild.voiceAdapterCreator,
            });
            __classPrivateFieldGet(this, _ConnectionContainer_instances, "m", _ConnectionContainer_prepareAudioPlayer).call(this);
            return true;
        });
    }
    connect(interaction) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const user = (_a = interaction === null || interaction === void 0 ? void 0 : interaction.member) === null || _a === void 0 ? void 0 : _a.user.id;
            const guild = _1.default.guilds.cache.get((_b = interaction.guildId) !== null && _b !== void 0 ? _b : '');
            if (!user || !guild) {
                return false;
            }
            const member = guild.members.cache.get(user);
            const voice = member === null || member === void 0 ? void 0 : member.voice;
            if (!voice || !voice.channel) {
                if (interaction instanceof discord_js_1.CommandInteraction)
                    interaction.editReply("You must be in a voice channel!");
                else {
                    (_c = interaction.channel) === null || _c === void 0 ? void 0 : _c.send("You must be in a voice channel!");
                }
                return false;
            }
            try {
                if (!interaction.guildId) {
                    throw new Error("Need guild id");
                }
                this.connection = (0, voice_1.joinVoiceChannel)({
                    channelId: voice.channel.id,
                    guildId: interaction.guildId,
                    adapterCreator: guild.voiceAdapterCreator
                });
                __classPrivateFieldGet(this, _ConnectionContainer_instances, "m", _ConnectionContainer_prepareAudioPlayer).call(this);
                return true;
            }
            catch (err) {
                return false;
            }
        });
    }
    clearConnection() {
        if (this.connection) {
            this.connection.disconnect();
            this.connection = undefined;
        }
        if (this.audioPlayer) {
            this.audioPlayer.stop();
            this.audioPlayer = undefined;
        }
    }
    playSong(id) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isConnected()) {
                return false;
            }
            if (!isNaN(Number(id))) {
                try {
                    const num = parseInt(id);
                    if (num >= 0 && num < ((_b = (_a = this.playlists[this.playlist]) === null || _a === void 0 ? void 0 : _a.queue) !== null && _b !== void 0 ? _b : []).length) {
                        return yield __classPrivateFieldGet(this, _ConnectionContainer_instances, "m", _ConnectionContainer_startSong).call(this, num);
                    }
                    else {
                        return false;
                    }
                }
                catch (err) {
                    return false;
                }
            }
            if (this.playlists[this.playlist] === undefined)
                if (((_d = (_c = this.playlists[this.playlist]) === null || _c === void 0 ? void 0 : _c.queue) !== null && _d !== void 0 ? _d : []).length >= MAX_PLAYLIST_SIZE) {
                    throw new Error('maximum playlist size reached');
                }
            this.playlists[this.playlist].queue.push({ url: id, name: "" });
            try {
                const info = yield ytdl_core_1.default.getBasicInfo(id);
                this.playlists[this.playlist].queue[this.playlists[this.playlist].queue.length - 1].name = info.videoDetails.title;
                __classPrivateFieldGet(this, _ConnectionContainer_updateQueue, "f").call(this);
                const res = __classPrivateFieldGet(this, _ConnectionContainer_instances, "m", _ConnectionContainer_startSong).call(this, this.playlists[this.playlist].queue.length - 1);
                return yield res;
            }
            catch (err) {
                delete this.playlists[this.playlist].queue[-1];
                return false;
            }
        });
    }
    queueSong(url, pos = this.playlists[this.playlist].queue.length) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.playlists[this.playlist].queue.length >= MAX_PLAYLIST_SIZE) {
                throw new Error('maximum playlist size reached');
            }
            return ytdl_core_1.default.getBasicInfo(url).then((info) => {
                if (pos < this.playlists[this.playlist].queue.length) {
                    this.playlists[this.playlist].queue.splice(pos, 0, { url: url, name: info.videoDetails.title });
                    if (pos < this.currentsong) {
                        this.currentsong++;
                    }
                }
                else {
                    this.playlists[this.playlist].queue.push({ url: url, name: info.videoDetails.title });
                    __classPrivateFieldGet(this, _ConnectionContainer_updateQueue, "f").call(this);
                }
                return true;
            }).catch(() => {
                throw new Error('Could not load song, url probably incorrect');
            });
        });
    }
    setPlayList(index) {
        return __awaiter(this, void 0, void 0, function* () {
            if (index >= 0 && index < this.playlists.length) {
                this.playlist = index;
            }
        });
    }
    nextSong() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.isConnected()) {
                    return false;
                }
                if (this.shuffle) {
                    let num = Math.floor(Math.random() * this.playlists[this.playlist].queue.length - 1.01);
                    if (num < 0)
                        num = 0;
                    if (num >= this.playlists[this.playlist].queue.length - 1)
                        num = this.playlists[this.playlist].queue.length - 2;
                    if (num >= this.currentsong)
                        num++;
                    this.currentsong = num;
                }
                else {
                    this.currentsong++;
                }
                if (this.currentsong < this.playlists[this.playlist].queue.length) {
                    return yield __classPrivateFieldGet(this, _ConnectionContainer_instances, "m", _ConnectionContainer_startSong).call(this, this.currentsong);
                }
                else if (this.playlists[this.playlist].queue.length > 0) {
                    return yield __classPrivateFieldGet(this, _ConnectionContainer_instances, "m", _ConnectionContainer_startSong).call(this, 0);
                }
            }
            catch (err) {
                console.error(err);
            }
            return false;
        });
    }
    previousSong() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.isConnected()) {
                    return false;
                }
                this.currentsong--;
                if (this.currentsong >= 0) {
                    return yield __classPrivateFieldGet(this, _ConnectionContainer_instances, "m", _ConnectionContainer_startSong).call(this, this.currentsong);
                }
                else if (this.playlists[this.playlist].queue.length > 0) {
                    this.currentsong = this.playlists[this.playlist].queue.length - 1;
                    return yield __classPrivateFieldGet(this, _ConnectionContainer_instances, "m", _ConnectionContainer_startSong).call(this, this.currentsong);
                }
            }
            catch (err) {
                console.error(err);
            }
            return false;
        });
    }
    pause() {
        this.playing = false;
        if (this.audioPlayer)
            this.audioPlayer.pause();
    }
    play() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.isConnected()) {
                    this.playing = false;
                    return false;
                }
                if (this.audioPlayer !== undefined && this.audioPlayer.state.status === voice_1.AudioPlayerStatus.Paused) {
                    try {
                        yield this.audioPlayer.unpause();
                        this.playing = true;
                        return true;
                    }
                    catch (err) {
                        console.error(err);
                    }
                    return false;
                }
                else if (this.playlists[this.playlist].queue.length !== 0 && this.currentsong >= 0 && this.currentsong < this.playlists[this.playlist].queue.length) {
                    const res = yield __classPrivateFieldGet(this, _ConnectionContainer_instances, "m", _ConnectionContainer_startSong).call(this, this.currentsong);
                    this.playing = res;
                    return res;
                }
                else if (this.currentsong === undefined && this.playlists[this.playlist].queue.length > 0) {
                    const res = yield __classPrivateFieldGet(this, _ConnectionContainer_instances, "m", _ConnectionContainer_startSong).call(this, 0);
                    this.playing = res;
                    return res;
                }
            }
            catch (err) {
                console.error(err);
            }
            return false;
        });
    }
    clearQueue() {
        this.playlists[this.playlist].queue = [];
        __classPrivateFieldGet(this, _ConnectionContainer_updateQueue, "f").call(this);
        this.currentsong = 0;
        this.playing = false;
        if (this.audioPlayer !== undefined) {
            this.audioPlayer.stop();
        }
        return true;
    }
    getQueue() {
        return { queue: this.playlists[this.playlist].queue, currentsong: this.currentsong };
    }
    removeSong(id) {
        if (id === null) {
            return false;
        }
        try {
            if (this.audioPlayer && this.currentsong === parseInt(id)) {
                if (this.audioPlayer.state.status !== (voice_1.AudioPlayerStatus.Paused || voice_1.AudioPlayerStatus.Idle)) {
                    return false;
                }
                else {
                    this.audioPlayer.stop();
                }
            }
            this.playlists[this.playlist].queue.splice(parseInt(id), 1);
            __classPrivateFieldGet(this, _ConnectionContainer_updateQueue, "f").call(this);
            return true;
        }
        catch (err) {
            console.error(err);
            return false;
        }
    }
    toggleLoop(value) {
        this.loop = value;
        this.shuffle = false;
    }
    toggleShuffle(value) {
        this.shuffle = value;
    }
    replay() {
        return __awaiter(this, void 0, void 0, function* () {
            __classPrivateFieldGet(this, _ConnectionContainer_instances, "m", _ConnectionContainer_startSong).call(this, this.currentsong);
        });
    }
}
exports.ConnectionContainer = ConnectionContainer;
_ConnectionContainer_setPlaylists = new WeakMap(), _ConnectionContainer_updateQueue = new WeakMap(), _ConnectionContainer_instances = new WeakSet(), _ConnectionContainer_startSong = function _ConnectionContainer_startSong(id) {
    return __awaiter(this, void 0, void 0, function* () {
        this.currentsong = id;
        this.currentsongplaylist = this.playlist;
        this.currentsong = this.currentsong % this.playlists[this.playlist].queue.length;
        if (!this.audioPlayer) {
            __classPrivateFieldGet(this, _ConnectionContainer_instances, "m", _ConnectionContainer_prepareAudioPlayer).call(this);
        }
        try {
            if (!this.connection || !this.audioPlayer) {
                this.playing = false;
                return false;
            }
            const audiosource = (0, voice_1.createAudioResource)((0, ytdl_core_1.default)(this.playlists[this.playlist].queue[id].url, { filter: 'audioonly' }));
            this.audioPlayer.play(audiosource);
            this.playing = true;
        }
        catch (err) {
            console.error(err);
            this.playing = false;
            this.playlists[this.playlist].queue.splice(id, 1);
            return false;
        }
        return true;
    });
}, _ConnectionContainer_prepareAudioPlayer = function _ConnectionContainer_prepareAudioPlayer() {
    var _a;
    if (!this.isConnected()) {
        return;
    }
    this.audioPlayer = (0, voice_1.createAudioPlayer)();
    this.audioPlayer.on(voice_1.AudioPlayerStatus.Idle, () => __awaiter(this, void 0, void 0, function* () {
        var _b, _c;
        if (this.playing) {
            if (this.shuffle) {
                let num = Math.floor(Math.random() * this.playlists[this.playlist].queue.length - 1.01);
                if (num < 0)
                    num = 0;
                if (num >= this.playlists[this.playlist].queue.length - 1)
                    num = this.playlists[this.playlist].queue.length - 2;
                if (num >= this.currentsong)
                    num++;
                yield __classPrivateFieldGet(this, _ConnectionContainer_instances, "m", _ConnectionContainer_startSong).call(this, num);
                (0, interface_1.updateInterface)(this, undefined, false, false, true);
            }
            else {
                switch (this.loop) {
                    case loop_1.LoopEnum.ALL:
                        if (this.currentsong >= this.playlists[this.playlist].queue.length - 1) {
                            this.currentsong = 0;
                        }
                        else {
                            this.currentsong++;
                        }
                        break;
                    case loop_1.LoopEnum.NONE:
                        if (this.currentsong >= this.playlists[this.playlist].queue.length - 1) {
                            this.playing = false;
                            (_b = this.audioPlayer) === null || _b === void 0 ? void 0 : _b.stop();
                            return;
                        }
                        else {
                            this.currentsong++;
                        }
                        break;
                    default:
                        //do nothing
                        break;
                }
                yield __classPrivateFieldGet(this, _ConnectionContainer_instances, "m", _ConnectionContainer_startSong).call(this, this.currentsong);
                (0, interface_1.updateInterface)(this, undefined, false, false, true);
            }
        }
        else {
            (_c = this.audioPlayer) === null || _c === void 0 ? void 0 : _c.stop();
        }
    }));
    this.audioPlayer.on('error', (err) => __awaiter(this, void 0, void 0, function* () {
        if (this.crashed) {
            return;
        }
        this.crashed = true;
        console.error(err);
        setTimeout(() => {
            var _a, _b;
            (_a = this.audioPlayer) === null || _a === void 0 ? void 0 : _a.unpause();
            this.audioPlayer = (0, voice_1.createAudioPlayer)();
            (_b = this.connection) === null || _b === void 0 ? void 0 : _b.subscribe(this.audioPlayer);
            __classPrivateFieldGet(this, _ConnectionContainer_instances, "m", _ConnectionContainer_prepareAudioPlayer).call(this);
            this.play();
            this.crashed = false;
        }, 500);
    }));
    (_a = this.connection) === null || _a === void 0 ? void 0 : _a.subscribe(this.audioPlayer);
};
//# sourceMappingURL=connectionManager.js.map