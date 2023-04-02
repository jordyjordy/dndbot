import {
    createAudioResource,
    VoiceConnectionStatus,
    AudioPlayerStatus,
    joinVoiceChannel,
    createAudioPlayer,
    DiscordGatewayAdapterCreator,
    VoiceConnectionState,
    VoiceConnection,
    AudioPlayer,
} from '@discordjs/voice';
import { CommandInteraction, Interaction, Message } from 'discord.js';
import client from ".";
import { updateInterface } from './utils/interface';
import QueueManager, { QueueStatus } from './queueManager';
import { stream } from 'play-dl';
import SSEManager from '../util/SSeManager';
export class ConnectionManager {
    server: string;
    connection: VoiceConnection | undefined;
    audioPlayer: AudioPlayer | undefined;
    queueMessage: Message | undefined;
    queueManager: QueueManager;
    crashed: boolean;
    playing: boolean;
    lastChannel: string;
    lastGuild: string;

    constructor(server: string, queueManager: QueueManager) {
        this.queueManager = queueManager;
        this.server = server;
        this.playing = false;
        this.crashed = false;
    }

    isConnected(): boolean {
        return !!(this.connection && this.connection.state.status !== VoiceConnectionStatus.Disconnected);
    }

    async connectToChannel({ channelId, userId }: { channelId: string, userId?: string } | { userId: string, channelId?: string }): Promise<boolean> {
        const guild = client.guilds.cache.get(this.server);
        const determinedChannelId = channelId ??  ((await guild?.members?.fetch(userId as string))?.voice.channelId);
        if(!determinedChannelId) {
            return false;
        }
        this.lastChannel = determinedChannelId;
        this.connection = joinVoiceChannel({
            channelId: determinedChannelId,
            guildId: this.server,
            adapterCreator: guild?.voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator,
        });

        const networkStateChangeHandler = (oldNetworkState: VoiceConnectionState, newNetworkState: VoiceConnectionState) => {
            const newUdp = Reflect.get(newNetworkState, 'udp');
            clearInterval(newUdp?.keepAliveInterval);
        };
        this.connection.on('stateChange', (oldState, newState) => {
            Reflect.get(oldState, 'networking')?.off('stateChange', networkStateChangeHandler);
            Reflect.get(newState, 'networking')?.on('stateChange', networkStateChangeHandler);
        });
        this.#prepareAudioPlayer();
        return true;
    }

    async connect(interaction: Interaction): Promise<boolean> {

        const user = interaction?.member?.user.id;
        const guild = client.guilds.cache.get(interaction.guildId ?? '');
        if (!user || !guild) {
            return false;
        }
        const member = guild.members.cache.get(user);
        const voice = member?.voice;
        if (!voice || !voice.channel) {
            if (interaction instanceof CommandInteraction)
                interaction.editReply("You must be in a voice channel!");
            else {
                interaction.channel?.send("You must be in a voice channel!");
            }
            return false;
        }
        try {
            if (!interaction.guildId) {
                throw new Error("Need guild id");
            }
            this.lastChannel = voice.channel.id;
            this.lastGuild = interaction.guildId;
            this.connection = joinVoiceChannel({
                channelId: voice.channel.id,
                guildId: interaction.guildId,
                adapterCreator: guild.voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator,
            });
            this.#prepareAudioPlayer();
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    clearConnection(): void {
        if (this.connection) {
            this.connection.disconnect();
            this.connection = undefined;
        }
        if (this.audioPlayer) {
            this.audioPlayer.stop();
            this.audioPlayer = undefined;
        }
    }

    async playSong(id: string): Promise<boolean> {
        if (!this.isConnected()) {
            return false;
        }
        if (!isNaN(Number(id))) {
            try {
                this.queueManager.currentSongPlaylist = this.queueManager.botDisplayPlaylist;
                this.queueManager.selectSong(parseInt(id));
                return await this.#startSong();
            } catch (err) {
                return false;
            }
        }
        try {
            const songPos = await this.queueManager.queueSong({ url: id });
            try {
                this.queueManager.selectSong(songPos);
                const res = this.#startSong();
                return await res;
            } catch (err) {
                this.queueManager.removeSong(songPos);
                return false;
            }
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async nextSong(): Promise<boolean> {
        try {
            if (!this.isConnected()) {
                return false;
            }
            const songNumber = this.queueManager.goToNextSong();
            return await this.#startSong(songNumber);
        } catch (err) {
            console.error(err);
        }
        return false;
    }

    async previousSong(): Promise<boolean> {
        try {
            if (!this.isConnected()) {
                return false;
            }
            const songNumber = this.queueManager.goToPreviousSong();
            return await this.#startSong(songNumber);
        } catch (err) {
            console.error(err);
        }
        return false;
    }

    pause(): void {
        this.playing = false;
        if (this.audioPlayer)
            this.audioPlayer.pause();
    }

    async play(force = false): Promise<boolean> {
        try {
            if (!this.isConnected()) {
                this.playing = false;
                return false;
            }
            if (
                !force && this.audioPlayer !== undefined &&
                (this.audioPlayer.state.status === AudioPlayerStatus.Paused || this.audioPlayer.state.status === AudioPlayerStatus.AutoPaused)
            ) {
                try {
                    const unpaused = await this.audioPlayer.unpause();
                    if(!unpaused) {
                        this.audioPlayer.stop();
                        this.#prepareAudioPlayer();
                        return false;
                    }
                    this.playing = true;
                    return true;
                } catch (err) {
                    console.error(err);
                }
                return false;
            }
            await this.#startSong();
        } catch (err) {
            console.error(err);
        }
        return false;
    }


    async #startSong(id: number = this.queueManager.currentSong): Promise<boolean> {
        try {
            if(!this.audioPlayer || !this.audioPlayer.playable) {
                this.audioPlayer?.stop();
                await this.#prepareAudioPlayer();
            }
            if (!this.connection || !this.audioPlayer) {
                this.playing = false;
                return false;
            }

            this.queueManager.selectSong(id);
            const songUrl = this.queueManager.getCurrentSongUrl();
            if (!songUrl) {
                throw new Error('song could not be found it seems');
            }

            const song = await stream(songUrl, { discordPlayerCompatibility: true });
            const audiosource = createAudioResource(song.stream);
            if(!this.audioPlayer) {
                await this.connectToChannel({ channelId: this.lastChannel });
                await this.#prepareAudioPlayer();
            }
            if(!this.audioPlayer) {
                throw new Error('something went wrong, song could not be played');
            }
            this.audioPlayer.play(audiosource);
            this.playing = true;
        } catch (err) {
            console.error(err);
            this.playing = false;
            return false;
        }
        return true;
    }
    async #prepareAudioPlayer(): Promise<void> {
        if (!this.isConnected()) {
            return;
        }
        this.audioPlayer = createAudioPlayer();
        this.audioPlayer.on(AudioPlayerStatus.Idle, async () => {
            this.queueManager.goToNextSong();
            await this.#startSong();
            SSEManager.publish(this.server, { ...(await this.getPlayStatus()) });
            updateInterface(this, undefined, false, false, true);
        });

        this.audioPlayer.on('error', async (err) => {
            if (this.crashed) {
                console.log('crashed?');
                return;
            }
            this.crashed = true;
            console.error(err);
            setTimeout(() => {
                this.audioPlayer?.stop();
                this.audioPlayer = createAudioPlayer();
                this.connection?.subscribe(this.audioPlayer);
                this.#prepareAudioPlayer();
                this.play();
                this.crashed = false;
            }, 500);
        });

        this.connection?.subscribe(this.audioPlayer);
    }

    async getPlayStatus(): Promise<QueueStatus & { playing: boolean }> {
        const playing = this.playing;
        const playStatus = this.queueManager.getPlayStatus();
        return { playing, ...playStatus };
    }
}
