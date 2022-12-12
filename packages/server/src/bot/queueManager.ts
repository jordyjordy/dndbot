import { isEmpty} from 'lodash'
import PlayList, { Song } from './Playlist';
import axios from 'axios';
import { LoopEnum } from './utils/loop';
import ytdl from 'ytdl-core'

const MAX_PLAYLIST_SIZE = 24

export default class QueueManager {
    server: string
    playlists: PlayList[]
    currentPlaylist: number
    currentSongPlaylist: number;
    currentSong:number;
    shuffle:boolean;
    loop: LoopEnum;

    constructor(server: string) {
        this.server = server;
        this.currentPlaylist = 0;
        this.playlists = [];
        this.currentSong = 0;
        this.currentSongPlaylist = 0;
        this.shuffle = false;
        this.loop = LoopEnum.NONE;
    }

    initialize = async ():Promise<void> => {
        await this.#setPlaylists();
    }
    

    #setPlaylists = ():Promise<void> => {
        return axios.get(`${process.env.SERVER_IP}/playlists/list?server=${this.server}`).then(response => {
            if(isEmpty(response.data)) {
                axios.post(`${process.env.SERVER_IP}/playlists`,{name: 'default', server:this.server })
            } else {
                this.playlists = response.data
                this.getCurrentPlaylist().queue = [...response.data[0].queue] ?? []
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
            this.playlists.push(new PlayList(res.data.playlist));
            return true
        }).catch(() => false)
    }

    deletePlaylist = async(id: number):Promise<boolean> => {
        if(id === this.currentPlaylist) {
            return false;
        }
        return axios.delete(`${process.env.SERVER_IP}/playlists?id=${this.playlists[id]._id}`).then(() => {
            this.playlists.splice(id,1)
            if(this.currentPlaylist >= this.playlists.length) {
                this.currentPlaylist -= 1
                this.currentSong = 0
            } else if (this.currentPlaylist > id) {
                this.currentPlaylist -= 1;
            }
            return true;
        }).catch(() => false)
    }

    renamePlaylist = async (playlist: number, name: string):Promise<boolean> => {
        this.playlists[playlist].name = name;
        return axios.put(`${process.env.SERVER_IP}/playlists`, {playlist: this.playlists[playlist]}).then(() => true).catch(() => false)
    }

    #updateQueue = (): void => {
        axios.put(`${process.env.SERVER_IP}/playlists`, {playlist: this.getCurrentPlaylist()})
    }

    async setPlayList(index: number):Promise<void> {
        if(index >= 0 && index < this.playlists.length) {
            this.currentPlaylist = index
        }
    }

    getCurrentQueue = ():{name: string, url: string}[] => {
        return this.getCurrentPlaylist()?.queue ?? []
    }

    toggleLoop(value:LoopEnum):void {
        this.loop = value
        this.shuffle = false

    }
    toggleShuffle(value:boolean):void {
        this.shuffle = value
    }

    selectSong(id:number):void {
        this.currentSong = id
        this.currentSongPlaylist = this.currentPlaylist
        this.currentSong = this.currentSong % this.getCurrentPlaylist().queue.length;
    }

    goToNextSong():number {
        if(this.loop) {
            return this.currentSong;
        }
        if(this.shuffle) {
            let num = Math.floor(Math.random() * this.getCurrentPlaylist().queue.length-1.01)
            if(num < 0) num = 0
            if (num >= this.getCurrentPlaylist().queue.length -1) num = this.getCurrentPlaylist().queue.length-2
            if(num >= this.currentSong) num++
            this.currentSong = num;
        } else {
            this.currentSong++;
        }
        this.currentSong = this.currentSong % this.getCurrentPlaylist().queue.length
        return this.currentSong;
    }

    goToPreviousSong():number {
        this.currentSong--;
        if(this.currentSong < 0) {
            this.currentSong = this.getCurrentPlaylist().queue.length - 1;
        }
        return this.currentSong;
    }

    removeSong(id:number):boolean {
        if(id === null) {
            return false
        }
        try {
            this.getCurrentPlaylist().removeSong(id);
            this.#updateQueue();
            return true
        }  catch(err) {
            console.error(err)
            return false
        }
    }

    clearQueue():boolean {
        this.getCurrentPlaylist().clearQueue;
        this.#updateQueue();
        this.currentSong = 0
        return true
    }
    getQueue():{queue:{url:string,name:string}[],currentsong:number} {
        return {queue:this.getCurrentPlaylist().queue,currentsong:this.currentSong}
    }

    getCurrentPlaylist():PlayList {
        return this.playlists[this.currentPlaylist];
    }

    getCurrentSong(): Song {
        return this.getCurrentPlaylist().getSong(this.currentSong);
    }

    getCurrentSongUrl(): string {
        return this.getCurrentPlaylist().getSongUrl(this.currentSong);
    }

    queueSong({ url, pos=this.getCurrentPlaylist().queue.length, name }: {url: string, pos?:number, name?: string }):Promise<number> {
        if(this.getCurrentPlaylist().queue.length >= MAX_PLAYLIST_SIZE) {
            throw new Error('maximum playlist size reached');
        }
        return ytdl.getBasicInfo(url).then((info) => {
            if(pos < this.getCurrentPlaylist().queue.length) {
                this.getCurrentPlaylist().insertSong({url, name: name ?? info.videoDetails.title}, pos)
                if(pos < this.currentSong) {
                    this.currentSong++
                }
            } else {
                this.getCurrentPlaylist().insertSong({url ,name: name ?? info.videoDetails.title})
                this.#updateQueue();
            }
            return pos;
        }).catch(() => {
            throw new Error('Could not load song, url probably incorrect')
        })
    }
}