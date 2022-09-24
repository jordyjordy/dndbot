import { 
    VoiceConnection,
    createAudioResource,
    AudioPlayer,
    VoiceConnectionStatus, 
    AudioPlayerStatus,
    joinVoiceChannel,
    createAudioPlayer,
    DiscordGatewayAdapterCreator
} from '@discordjs/voice';
import { CommandInteraction, Interaction, Message } from 'discord.js';
import ytdl from 'ytdl-core-discord'
import { LoopEnum } from './utils/loop';
import client from "."
import { updateInterface } from './utils/interface';
import axios from 'axios';
import { isEmpty } from 'lodash'
// import youtubedl from 'youtube-dl-exec'
const connectionContainers:connectionMap = {}

const MAX_PLAYLIST_SIZE = 24

type connectionMap = {
    [key:string]:ConnectionContainer
}

export async function getConnectionContainer(server:string):Promise<ConnectionContainer> {
    if(connectionContainers[server]){
        return connectionContainers[server]
    }
    const container = new ConnectionContainer(server)
    await container.configurePlaylists();
    connectionContainers[server] = container
    return container
}

export async function destroyConnectionContainer(server:string):Promise<boolean> {
    if(connectionContainers[server]) {
        try{
            connectionContainers[server].clearConnection()
            delete connectionContainers[server]
            return true
        } catch(err) {
            return false
        }
    } 
    return true
}

export class ConnectionContainer {
    playlists: {_id: string, name: string, server: string, queue:{url: string, name:string}[] }[]
    server: string
    playlist: number
    connection:VoiceConnection | undefined;
    currentsongplaylist: number;
    loop:LoopEnum;
    currentsong:number
    audioPlayer:AudioPlayer | undefined
    queueMessage:Message | undefined
    playing:boolean
    shuffle:boolean
    crashed:boolean
    constructor(server: string) {
        this.server = server
        this.loop = LoopEnum.NONE
        this.playlist = 0
        this.playlists = [];
        this.currentsong = 0
        this.currentsongplaylist = 0
        this.playing = false
        this.shuffle = false
        this.crashed = false
    }

    configurePlaylists = async ():Promise<void> => {
        await this.#setPlaylists()
        return;
    }

    #setPlaylists = ():Promise<void> => {
        return axios.get(`${process.env.SERVER_IP}/playlists/list?server=${this.server}`).then(response => {
            if(isEmpty(response.data)) {
                axios.post(`${process.env.SERVER_IP}/playlists`,{name: 'default', server:this.server })
            } else {
                this.playlists = response.data
                this.playlists[this.playlist].queue = [...response.data[0].queue] ?? []
            }
            return;
        })
    }

    updatePlaylists = async ():Promise<void> => {
        return axios.get(`${process.env.SERVER_IP}/playlists/list?server=${this.server}`).then(response => {
            this.playlists = response.data
        })
    }

    createPlaylist = async (name: string):Promise<boolean> => {
        return axios.post(`${process.env.SERVER_IP}/playlists`,{name: name, server: this.server}).then((res) => {
            this.playlists.push(res.data.playlist);
            return true
        }).catch(() => false)
    }

    deletePlaylist = async(id: number):Promise<boolean> => {
        if(id === this.playlist) {
            return false;
        }
        return axios.delete(`${process.env.SERVER_IP}/playlists?id=${this.playlists[id]._id}`).then(() => {
            this.playlists.splice(id,1)
            if(this.playlist >= this.playlists.length) {
                this.playlist -= 1
                this.currentsong = 0
                if(this.audioPlayer) {
                    this.audioPlayer.stop()
                }
            }
            return true;
        }).catch(() => false)
    }

    renamePlaylist = async (playlist: number, name: string):Promise<boolean> => {
        this.playlists[playlist].name = name;
        return axios.put(`${process.env.SERVER_IP}/playlists`, {playlist: this.playlists[playlist]}).then(() => true).catch(() => false)
    }

    #updateQueue = (): void => {
        axios.put(`${process.env.SERVER_IP}/playlists`, {playlist: this.playlists[this.playlist]})
    }

    isConnected():boolean {
        return !!(this.connection && this.connection.state.status !== VoiceConnectionStatus.Disconnected)
    }

    getCurrentQueue = ():{name: string, url: string}[] => {
        return this.playlists[this.playlist]?.queue ?? []
    }

    async connect(interaction:Interaction):Promise<boolean> {
        const user = interaction?.member?.user.id
        const guild = client.guilds.cache.get(interaction.guildId ?? '')
        if (!user || !guild) {
            return false;
        }
        const member = guild.members.cache.get(user)
        const voice = member?.voice
        if(!voice || !voice.channel) {
            if(interaction instanceof CommandInteraction)
                interaction.editReply("You must be in a voice channel!")
            else {
                interaction.channel?.send("You must be in a voice channel!")
            }
            return false
        }
        try {
            if(!interaction.guildId) {
                throw new Error("Need guild id");
            }
            this.connection = joinVoiceChannel({
                channelId: voice.channel.id,
                guildId: interaction.guildId,
                adapterCreator: guild.voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator
            })
            this.#prepareAudioPlayer()
            return true
        } catch(err) {
            return false
        }
    }

    clearConnection():void {
        if(this.connection) {
            this.connection.disconnect()
            this.connection = undefined
        }
        if(this.audioPlayer) {
            this.audioPlayer.stop()
            this.audioPlayer = undefined
        }
    }

    async playSong(id:string):Promise<boolean> {
        if(!this.isConnected()) {
            return false
        }
        if(!isNaN(Number(id))) {
            try{
                const num = parseInt(id)
                if(num >= 0 && num < (this.playlists[this.playlist]?.queue ?? []).length) {
                    return await this.#startSong(num)
                } else {
                    return false
                }
            } catch(err) {
                return false
            }
        }
        if(this.playlists[this.playlist] === undefined) 
        if((this.playlists[this.playlist]?.queue ?? []).length >= MAX_PLAYLIST_SIZE) {
            throw new Error('maximum playlist size reached');
        }
        this.playlists[this.playlist].queue.push({url:id,name:""})
        try{
            const info = await ytdl.getBasicInfo(id)
            this.playlists[this.playlist].queue[this.playlists[this.playlist].queue.length-1].name = info.videoDetails.title
            this.#updateQueue();
            const res =  this.#startSong(this.playlists[this.playlist].queue.length-1)
            return await res
        } catch(err) {
            delete this.playlists[this.playlist].queue[-1]
            return false
        }
    }

    async queueSong(url:string,pos=this.playlists[this.playlist].queue.length):Promise<boolean> {
        if(this.playlists[this.playlist].queue.length >= MAX_PLAYLIST_SIZE) {
            throw new Error('maximum playlist size reached');
        }
        return ytdl.getBasicInfo(url).then((info) => {
            if(pos < this.playlists[this.playlist].queue.length) {
                this.playlists[this.playlist].queue.splice(pos,0,{url:url,name:info.videoDetails.title})
                if(pos < this.currentsong) {
                    this.currentsong++
                }
            } else {
                this.playlists[this.playlist].queue.push({url:url,name:info.videoDetails.title})
                this.#updateQueue();
            }
            return true
        }).catch(() => {
            throw new Error('Could not load song, url probably incorrect')
        })
    }

    async setPlayList(index: number):Promise<void> {
        if(index >= 0 && index < this.playlists.length) {
            this.playlist = index
        }
    }

    async nextSong():Promise<boolean> {
        try{
            if(!this.isConnected()) {
                return false
            }
            if(this.shuffle) {
                let num = Math.floor(Math.random() * this.playlists[this.playlist].queue.length-1.01)
                if(num < 0) num = 0
                if (num >= this.playlists[this.playlist].queue.length -1) num = this.playlists[this.playlist].queue.length-2
                if(num >= this.currentsong) num++
                this.currentsong = num;
            } else {
                this.currentsong++;
            }
            if(this.currentsong < this.playlists[this.playlist].queue.length) {
                return await this.#startSong(this.currentsong)
            } else if(this.playlists[this.playlist].queue.length > 0) {
                return await this.#startSong(0)
            }
        } catch(err) {
            console.error(err)
        }
        return false
    }

    async previousSong():Promise<boolean> {
        try{
            if(!this.isConnected()) {
                return false
            }
            this.currentsong--;
            if(this.currentsong >= 0) {
                return await this.#startSong(this.currentsong)
            } else if(this.playlists[this.playlist].queue.length > 0) {
                this.currentsong = this.playlists[this.playlist].queue.length-1
                return await this.#startSong(this.currentsong)
            }
        } catch(err) {
            console.error(err)
        }
        return false
    }

    pause():void {
        this.playing = false
        if (this.audioPlayer)
            this.audioPlayer.pause()
    }
    
    async play(): Promise<boolean> {
        try{
            if (!this.isConnected()) {
                this.playing = false
                return false
            }
            if (this.audioPlayer !== undefined && this.audioPlayer.state.status === AudioPlayerStatus.Paused) {
                try{
                    await this.audioPlayer.unpause()
                    this.playing = true
                    return true
                } catch(err) {
                    console.error(err)
                }
                return false
            } else if (this.playlists[this.playlist].queue.length !== 0 && this.currentsong >= 0 && this.currentsong < this.playlists[this.playlist].queue.length) {
                const res = await this.#startSong(this.currentsong)
                this.playing = res
                return res
            } else if (this.currentsong === undefined && this.playlists[this.playlist].queue.length > 0) {
                const res = await this.#startSong( 0)
                this.playing = res
                return res
            }
        } catch(err) {
            console.error(err)
        }
        return false;
    }

    clearQueue():boolean {
        this.playlists[this.playlist].queue = []
        this.#updateQueue();
        this.currentsong = 0
        this.playing = false
        if (this.audioPlayer !== undefined) {
            this.audioPlayer.stop()
        }
        return true
    }
    getQueue():{queue:{url:string,name:string}[],currentsong:number} {
        return {queue:this.playlists[this.playlist].queue,currentsong:this.currentsong}
    }

    removeSong(id:string):boolean {
        if(id === null) {
            return false
        }
        try {
            if (this.audioPlayer && this.currentsong === parseInt(id)) {
                if (this.audioPlayer.state.status !== (AudioPlayerStatus.Paused||AudioPlayerStatus.Idle)) {
                    return false
                } else {
                    this.audioPlayer.stop()
                }
            }
            this.playlists[this.playlist].queue.splice(parseInt(id),1)
            this.#updateQueue();
            return true
        }  catch(err) {
            console.error(err)
            return false
        }
    }
    toggleLoop(value:LoopEnum):void {
        this.loop = value
        this.shuffle = false

    }
    toggleShuffle(value:boolean):void {
        this.shuffle = value
    }
    async replay():Promise<void> {
        this.#startSong(this.currentsong)
    }

    async #startSong(id:number):Promise<boolean> {
        this.currentsong = id
        this.currentsongplaylist = this.playlist
        this.currentsong = this.currentsong % this.playlists[this.playlist].queue.length;
        if (!this.audioPlayer) {
            this.#prepareAudioPlayer()
        }
        try{
            if (!this.connection || !this.audioPlayer) {
                this.playing = false
                return false
            }
            const audiosource = createAudioResource(await ytdl(this.playlists[this.playlist].queue[id].url))
            this.audioPlayer.play(audiosource)
            this.playing = true
        } catch(err) {
            console.log('weeee');
            console.error(err)
            this.playing = false
            this.playlists[this.playlist].queue.splice(id,1)
            return false
        }
        return true
    }
    #prepareAudioPlayer():void {
        if (!this.isConnected()) {
            return
        }
        this.audioPlayer = createAudioPlayer()
        this.audioPlayer.on(AudioPlayerStatus.Idle,async ()=> {
            
            if (this.playing) {
                if (this.shuffle) {
                    let num = Math.floor(Math.random() * this.playlists[this.playlist].queue.length-1.01)
                    if(num < 0) num = 0
                    if (num >= this.playlists[this.playlist].queue.length -1) num = this.playlists[this.playlist].queue.length-2
                    if(num >= this.currentsong) num++
                    await this.#startSong(num)
                    updateInterface(this,undefined,false,false,true)
                } else {
                    switch(this.loop) {
                        case LoopEnum.ALL:
                            if (this.currentsong >= this.playlists[this.playlist].queue.length-1) {
                                this.currentsong = 0
                            } else {
                                this.currentsong++
                            }
                            break
                        case LoopEnum.NONE:
                            if (this.currentsong >= this.playlists[this.playlist].queue.length-1) {
                                this.playing = false
                                this.audioPlayer?.stop()
                                return
                            } else {
                                this.currentsong++
                            }
                            break
                        default:
                            //do nothing
                            break
                    }
                    await this.#startSong(this.currentsong)
                    updateInterface(this,undefined,false,false,true)
                }
            } else {
                this.audioPlayer?.stop()
            }
        })
        this.audioPlayer.on('error',async (err) => {
            if (this.crashed) {
                return
            }
            this.crashed = true
            console.error(err)
            setTimeout(() => {
                this.audioPlayer?.unpause()
                this.audioPlayer = createAudioPlayer()
                this.connection?.subscribe(this.audioPlayer)
                this.#prepareAudioPlayer()
                this.play()
                this.crashed = false
            }, 500)
        })
        this.connection?.subscribe(this.audioPlayer)
    }
}
