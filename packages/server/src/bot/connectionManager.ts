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
    AudioResource,
} from '@discordjs/voice';
import { CommandInteraction, Interaction, Message } from 'discord.js';
import client from ".";
import SSEManager from '../util/SSeManager';
import { Readable } from 'stream';

const connectionContainers: connectionMap = {};

type connectionMap = {
    [key: string]: { connectionManager: ConnectionManager }
};

export async function getConnection(server: string): Promise<{ connectionManager: ConnectionManager }> {
    if (connectionContainers[server]) {
        return connectionContainers[server];
    }
    const connectionManager = new ConnectionManager(server);
    connectionContainers[server] = { connectionManager };
    return connectionContainers[server];
}

export async function destroyConnectionContainer(server: string): Promise<boolean> {
    if (connectionContainers[server]) {
        try {
            connectionContainers[server].connectionManager.clearConnection();
            delete connectionContainers[server];
            return true;
        } catch (err) {
            return false;
        }
    }
    return true;
}

export class ConnectionManager {
    server: string;
    connection: VoiceConnection | undefined;
    audioPlayer: AudioPlayer | undefined;
    queueMessage: Message | undefined;
    crashed: boolean;
    playing: boolean;
    lastChannel: string;
    lastGuild: string;
    stream: Readable;
    audioSource: AudioResource;

    constructor(server: string) {
        this.server = server;
        this.playing = false;
        this.crashed = false;
    }

    isConnected(): boolean {
        return !!(this.connection && this.connection.state.status !== VoiceConnectionStatus.Disconnected);
    }

    async connectToChannel(channelId: string, guildId: string): Promise<boolean> {
        const guild = client.guilds.cache.get(guildId);
        this.lastChannel = channelId;
        this.lastGuild = guildId;
        this.connection = joinVoiceChannel({
            channelId,
            guildId,
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

    async startSong(stream: Readable): Promise<boolean> {
        try {
            if(!this.audioPlayer || !this.audioPlayer.playable) {
                this.audioPlayer?.stop();
                await this.#prepareAudioPlayer();
            }
            if (!this.connection || !this.audioPlayer) {
                this.playing = false;
                return false;
            }
            this.stream?.destroy();
            const audiosource = createAudioResource(stream);
            this.stream = stream;
            if(!this.audioPlayer) {
                await this.connectToChannel(this.lastChannel, this.lastGuild);
                await this.#prepareAudioPlayer();
            }
            if(!this.audioPlayer) {
                throw new Error('something went wrong, song could not be played');
            }
            this.audioPlayer.play(audiosource);
            SSEManager.publish(this.server, { playing: true });
            this.playing = true;

        } catch (err) {
            console.error(err);
            this.playing = false;
            return false;
        }
        return true;
    }

    play(): void {
        if(this.audioPlayer) {
            this.audioPlayer.unpause();
            SSEManager.publish(this.server, { playing: true });
        }
    }

    pause(): void {
        if(this.audioPlayer) {
            this.audioPlayer.pause();
            SSEManager.publish(this.server, { playing: false });
        }
    }

    async #prepareAudioPlayer(): Promise<void> {
        if (!this.isConnected()) {
            return;
        }
        this.audioPlayer = createAudioPlayer();
        this.audioPlayer.on(AudioPlayerStatus.Idle, async () => {
            SSEManager.publish(this.server, { songEnded: true });
        });

        this.audioPlayer.on('error', async () => {
            SSEManager.publish(this.server, { songEnded: true, playing: false });
        });

        this.connection?.subscribe(this.audioPlayer);
    }
}
