import { isEmpty} from 'lodash'
import playList, { Song } from './playlist';
import { LoopEnum } from './utils/loop';
import ytdl from 'ytdl-core'
import PlayList from '../model/playlist';

const MAX_PLAYLIST_SIZE = 24

export interface QueueStatus {
    playlist: number;
    song: number;
    shuffle: boolean;
    loop: boolean;
}

export default class QueueManager {
    server: string
    playlists: playList[]
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

    getPlayStatus = (): QueueStatus => {
        return {
            playlist: this.currentPlaylist,
            song: this.currentSong,
            shuffle: this.shuffle,
            loop: this.loop !== LoopEnum.NONE,
        }
    }

    initialize = async ():Promise<void> => {
        await this.#setPlaylists();
    }
    

    #setPlaylists = async ():Promise<void> => { 
        const playlists = (await PlayList.findByServerId(this.server)).map((playlist) => new playList(playlist));
        if(isEmpty(playlists)) {
           try {
                const playlist = await PlayList.createNewPlayList('default', this.server);
                this.playlists = [new playList(playlist)];
           } catch(err) {
                console.log(err);
           }
        } else {
            this.playlists = playlists;
            this.getCurrentPlaylist().queue = [...this.getCurrentPlaylist().queue];
        }
    }


    updatePlaylists = async ():Promise<void> => {
        this.playlists = (await PlayList.findByServerId(this.server)).map((playlist) => new playList(playlist));
    }

    createPlaylist = async (name: string):Promise<boolean> => {
        try {
            const playlist = await PlayList.createNewPlayList(name, this.server);
            this.playlists.push(new playList(playlist));
            return true;
        } catch {
            return false;
        }
    }

    deletePlaylist = async(id: number):Promise<boolean> => {
        if(id === this.currentPlaylist) {
            return false;
        }
        try {
            await PlayList.findByIdAndDelete(this.playlists[id]._id);
            this.playlists.splice(id,1)
            if(this.currentPlaylist >= this.playlists.length) {
                this.currentPlaylist -= 1
                this.currentSong = 0
            } else if (this.currentPlaylist > id) {
                this.currentPlaylist -= 1;
            }
            return true;
        } catch {
            return false;
        }
    }

    renamePlaylist = async (playlist: number, name: string):Promise<boolean> => {
        try {
            await PlayList.findByIdAndUpdate(this.playlists[playlist]._id, this.playlists[playlist], {new: true})
            this.playlists[playlist].name = name;
            return true;
        } catch {
            return false;
        }
    }

    #updateQueue = async (): Promise<void> => {
        try {
            await PlayList.findByIdAndUpdate(this.getCurrentPlaylist()._id, this.getCurrentPlaylist(), {new: true})
        } catch {
            // do nothing
        }
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
        console.log(this.loop);
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

    async removeSong(id:number):Promise<boolean> {
        if(id === null) {
            return false
        }
        try {
            this.getCurrentPlaylist().removeSong(id);
            await this.#updateQueue();
            return true
        }  catch(err) {
            console.error(err)
            return false
        }
    }

    async clearQueue():Promise<boolean> {
        try {
            this.getCurrentPlaylist().clearQueue();
            await this.#updateQueue();
            this.currentSong = 0
            return true
        } catch {
            return false;
        }
    }
    getQueue():{queue:{url:string,name:string}[],currentsong:number} {
        return {queue:this.getCurrentPlaylist().queue,currentsong:this.currentSong}
    }

    getCurrentPlaylist():playList {
        return this.playlists[this.currentPlaylist];
    }

    getCurrentSong(): Song {
        return this.getCurrentPlaylist().getSong(this.currentSong);
    }

    getCurrentSongUrl(): string {
        return this.getCurrentPlaylist().getSongUrl(this.currentSong);
    }

    async queueSong({ url, pos=this.getCurrentPlaylist().queue.length, name }: {url: string, pos?:number, name?: string }):Promise<number> {
        if(this.getCurrentPlaylist().queue.length >= MAX_PLAYLIST_SIZE) {
            throw new Error('maximum playlist size reached');
        }
        return ytdl.getBasicInfo(url).then(async (info) => {
            if(pos < this.getCurrentPlaylist().queue.length) {
                this.getCurrentPlaylist().insertSong({url, name: name ?? info.videoDetails.title}, pos)
                if(pos < this.currentSong) {
                    this.currentSong++
                }
            } else {
                this.getCurrentPlaylist().insertSong({url ,name: name ?? info.videoDetails.title})
            }
            await this.#updateQueue();
            return pos;
        }).catch(() => {
            throw new Error('Could not load song, url probably incorrect')
        })
    }
}