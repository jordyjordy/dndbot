import { VoiceConnection, createAudioResource, AudioPlayer, VoiceConnectionStatus, AudioPlayerStatus, joinVoiceChannel, createAudioPlayer, DiscordGatewayAdapterCreator } from '@discordjs/voice';
import { CommandInteraction, Interaction, Message } from 'discord.js';
import ytdl from 'ytdl-core-discord'
import { LoopEnum } from './utils/loop';
import { client } from "."
import { updateInterface } from './utils/interface';
import axios from 'axios';
import { isEmpty } from 'lodash'
// import youtubedl from 'youtube-dl-exec'
const connectionContainers:connectionMap = {}

type connectionMap = {
    [key:string]:ConnectionContainer
}

export async function getConnectionContainer(server:string):Promise<ConnectionContainer> {
    if(connectionContainers[server]){
        return connectionContainers[server]
    }
    const container = new ConnectionContainer(server)
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
    server: string
    playlist: string
    connection:VoiceConnection;
    loop:LoopEnum;
    queue:{url:string,name:string}[]
    currentsong:number
    audioPlayer:AudioPlayer
    queueMessage:Message
    playing:boolean
    shuffle:boolean
    crashed:boolean
    constructor(server: string) {
        this.server = server
        this.loop = LoopEnum.NONE
        this.playlist = ''
        this.queue = []
        this.currentsong = 0
        this.playing = false
        this.shuffle = false
        this.crashed = false
        this.#setQueue(server)
    }

    #setQueue = (server: string):void => {
        axios.get(`${process.env.SERVER_IP}/playlists/list?server=${server}`).then(response => {
            if(isEmpty(response.data)) {
                axios.post(`${process.env.SERVER_IP}/playlists`,{name: 'default', server })
            } else {
                this.queue = [...this.queue, ...response.data[0].queue]
                this.playlist = response.data[0]._id
            }
        })
    }

    #updateQueue = (): void => {
        axios.put(`${process.env.SERVER_IP}/playlists`,{playlist: {_id: this.playlist, name: 'default', server: this.server, queue: this.queue } })
    }

    isConnected():boolean {
        return this.connection && this.connection.state.status !== VoiceConnectionStatus.Disconnected
    }

    async connect(interaction:Interaction):Promise<boolean> {
        const user = interaction.member.user.id
        const guild = client.guilds.cache.get(interaction.guildId)
        const member = guild.members.cache.get(user)
        const {voice} = member
        if(!voice || !voice.channel) {
            if(interaction instanceof CommandInteraction)
                interaction.editReply("You must be in a voice channel!")
            else {
                interaction.channel.send("You must be in a voice channel!")
            }
            return false
        }
        try {
            this.connection =  await joinVoiceChannel({
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
                if(num >= 0 && num < this.queue.length) {
                    return await this.#startSong(num)
                } else {
                    return false
                }
            } catch(err) {
                return false
            }
        }
        this.queue.push({url:id,name:""})
        try{
            const info = await ytdl.getBasicInfo(id)
            this.queue[this.queue.length-1].name = info.videoDetails.title
            this.#updateQueue();
            const res =  this.#startSong(this.queue.length-1)
            return await res
        } catch(err) {
            delete this.queue[-1]
            return false
        }
    }

    queueSong(url:string,pos=this.queue.length):Promise<boolean> {

        return ytdl.getBasicInfo(url).then((info) => {
            if(pos < this.queue.length) {
                this.queue.splice(pos,0,{url:url,name:info.videoDetails.title})
                if(pos < this.currentsong) {
                    this.currentsong++
                }
            } else {
                this.queue.push({url:url,name:info.videoDetails.title})
                this.#updateQueue();
            }
            return true
        }).catch((err) => {
            console.error(err)
            return false
        })
    }

    async nextSong():Promise<boolean> {
        try{
            if(!this.isConnected()) {
                return false
            }
            if(this.shuffle) {
                let num = Math.floor(Math.random() * this.queue.length-1.01)
                if(num < 0) num = 0
                if (num >= this.queue.length -1) num = this.queue.length-2
                if(num >= this.currentsong) num++
                this.currentsong = num;
            } else {
                this.currentsong++;
            }
            if(this.currentsong < this.queue.length) {
                return await this.#startSong(this.currentsong)
            } else if(this.queue.length > 0) {
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
            } else if(this.queue.length > 0) {
                this.currentsong = this.queue.length-1
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
    
    async play():Promise<boolean> {
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
            } else if (this.queue.length !== 0 && this.currentsong >= 0 && this.currentsong < this.queue.length) {
                const res = await this.#startSong(this.currentsong)
                this.playing = res
                return res
            } else if (this.currentsong === undefined && this.queue.length > 0) {
                const res = await this.#startSong( 0)
                this.playing = res
                return res
            }
        } catch(err) {
            console.error(err)
        }
    }

    clearQueue():boolean {
        this.queue = []
        this.#updateQueue();
        this.currentsong = 0
        this.playing = false
        if (this.audioPlayer !== undefined) {
            this.audioPlayer.stop()
        }
        return true
    }
    getQueue():{queue:{url:string,name:string}[],currentsong:number} {
        return {queue:this.queue,currentsong:this.currentsong}
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
            this.queue.splice(parseInt(id),1)
            this.#updateQueue();
            return true
        }  catch(err) {
            console.log(err)
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
        this.currentsong = this.currentsong % this.queue.length;
        if (!this.audioPlayer) {
            this.#prepareAudioPlayer()
        }
        try{
            if (!this.connection || !this.audioPlayer) {
                this.playing = false
                return false
            }
            const audiosource = createAudioResource(await ytdl(this.queue[id].url))
            this.audioPlayer.play(audiosource)
            this.playing = true
        } catch(err) {
            console.error(err)
            this.playing = false
            this.queue.splice(id,1)
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
                    let num = Math.floor(Math.random() * this.queue.length-1.01)
                    if(num < 0) num = 0
                    if (num >= this.queue.length -1) num = this.queue.length-2
                    if(num >= this.currentsong) num++
                    await this.#startSong(num)
                    updateInterface(this,undefined,false,false,true)
                } else {
                    switch(this.loop) {
                        case LoopEnum.ALL:
                            if (this.currentsong >= this.queue.length-1) {
                                this.currentsong = 0
                            } else {
                                this.currentsong++
                            }
                            break
                        case LoopEnum.NONE:
                            if (this.currentsong >= this.queue.length-1) {
                                this.playing = false
                                this.audioPlayer.stop()
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
                this.audioPlayer.stop()
            }
        })
        this.audioPlayer.on('error',async (err) => {
            if (this.crashed) {
                return
            }
            this.crashed = true
            console.error(err)
            setTimeout(() => {
                this.audioPlayer.unpause()
                this.audioPlayer = createAudioPlayer()
                this.connection.subscribe(this.audioPlayer)
                this.#prepareAudioPlayer()
                this.play()
                this.crashed = false
            }, 500)
        })
        this.connection.subscribe(this.audioPlayer)
    }
}
