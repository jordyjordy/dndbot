import { isEmpty} from 'lodash';
import playList, { Song } from './playlist';
import { LoopEnum } from './utils/loop';
import ytdl from 'ytdl-core';
import PlayList from '../model/playlist';
import { info } from 'console';

const MAX_PLAYLIST_SIZE = 24;

export interface QueueStatus {
    playlist: number;
    song: number;
    shuffle: boolean;
    loop: boolean;
}

export default class QueueManager {
    server: string;
    playlists: playList[];
    botDisplayPlaylist: number;
    currentSongPlaylist: number;
    currentSong:number;
    shuffle:boolean;
    loop: LoopEnum;

    constructor(server: string) {
        this.server = server;
        this.botDisplayPlaylist = 0;
        this.playlists = [];
        this.currentSong = 0;
        this.currentSongPlaylist = 0;
        this.shuffle = false;
        this.loop = LoopEnum.NONE;
    }

    getPlayStatus = (): QueueStatus => {
        return {
            playlist: this.currentSongPlaylist,
            song: this.currentSong,
            shuffle: this.shuffle,
            loop: this.loop !== LoopEnum.NONE,
        };
    };

    initialize = async ():Promise<void> => {
        await this.#setPlaylists();
    };
    

    #setPlaylists = async ():Promise<void> => { 
        const playlists = (await PlayList.findByServerId(this.server) ?? []).map((playlist) => new playList(playlist));
        if(isEmpty(playlists)) {
           try {
                const playlist = await PlayList.createNewPlayList('default', this.server);
                this.playlists = [new playList(playlist)];
           } catch(err) {
                console.log(err);
           }
        } else {
            this.playlists = playlists;
            this.getBotDisplayPlaylist().queue = [...this.getBotDisplayPlaylist().queue];
        }
    };


    updatePlaylists = async ():Promise<void> => {
        this.playlists = (await PlayList.findByServerId(this.server)).map((playlist) => new playList(playlist));
    };

    createPlaylist = async (name: string):Promise<boolean> => {
        try {
            const playlist = await PlayList.createNewPlayList(name, this.server);
            this.playlists.push(new playList(playlist));
            return true;
        } catch {
            return false;
        }
    };

    deletePlaylist = async(id: number):Promise<boolean> => {
        if(id === this.botDisplayPlaylist) {
            return false;
        }
        try {
            await PlayList.findByIdAndDelete(this.playlists[id]._id);
            this.playlists.splice(id,1);
            if(this.botDisplayPlaylist >= this.playlists.length) {
                this.botDisplayPlaylist -= 1;
                this.currentSong = 0;
            } else if (this.botDisplayPlaylist > id) {
                this.botDisplayPlaylist -= 1;
            }
            return true;
        } catch {
            return false;
        }
    };

    renamePlaylist = async (playlist: number, name: string):Promise<boolean> => {
        try {
            await PlayList.findByIdAndUpdate(this.playlists[playlist]._id, this.playlists[playlist], {new: true});
            this.playlists[playlist].name = name;
            return true;
        } catch {
            return false;
        }
    };

    #updateQueue = async (playlistId=this.botDisplayPlaylist): Promise<void> => {
        try {
            await PlayList.findByIdAndUpdate(this.playlists[playlistId]._id, this.playlists[playlistId], {new: true});
        } catch (err) {
            console.log(err);
            // do nothing
        }
    };

    async setBotDisplayPlaylist(index: number):Promise<void> {
        if(index >= 0 && index < this.playlists.length) {
            this.botDisplayPlaylist = index;
        }
    }

    getBotDisplayQueue = ():{name: string, url: string}[] => {
        return this.getBotDisplayPlaylist()?.queue ?? [];
    };

    toggleLoop(value:LoopEnum):void {
        this.loop = value;
        this.shuffle = false;

    }
    toggleShuffle(value:boolean):void {
        this.shuffle = value;
    }

    selectSong(id:number, playlistIndex: number = this.currentSongPlaylist):void {
        this.currentSong = id;
        this.currentSongPlaylist = playlistIndex;
        this.currentSong = this.currentSong % this.getCurrentSongPlaylist().queue.length;
    }

    goToNextSong():number {
        if(this.loop) {
            return this.currentSong;
        }
        if(this.shuffle) {
            let num = Math.floor(Math.random() * this.getCurrentSongPlaylist().queue.length-1.01);
            if(num < 0) num = 0;
            if (num >= this.getCurrentSongPlaylist().queue.length -1) num = this.getCurrentSongPlaylist().queue.length-2;
            if(num >= this.currentSong) num++;
            this.currentSong = num;
        } else {
            this.currentSong++;
        }
        this.currentSong = this.currentSong % this.getCurrentSongPlaylist().queue.length;
        return this.currentSong;
    }

    goToPreviousSong():number {
        this.currentSong--;
        if(this.currentSong < 0) {
            this.currentSong = this.getCurrentSongPlaylist().queue.length - 1;
        }
        return this.currentSong;
    }

    async removeSong(id:number, playlistId=this.botDisplayPlaylist):Promise<boolean> {
        if(id === null) {
            return false;
        }
        try {
            this.playlists[playlistId].removeSong(id);
            await this.#updateQueue(playlistId);
            return true;
        }  catch(err) {
            console.error(err);
            return false;
        }
    }

    async clearQueue(playlistId=this.botDisplayPlaylist):Promise<boolean> {
        try {
            this.playlists[playlistId].clearQueue();
            await this.#updateQueue(playlistId);
            this.currentSong = 0;
            return true;
        } catch {
            return false;
        }
    }
    getQueue():{queue:{url:string,name:string}[],currentsong:number} {
        return {queue:this.getBotDisplayPlaylist().queue,currentsong:this.currentSong};
    }

    getBotDisplayPlaylist():playList {
        return this.playlists[this.botDisplayPlaylist];
    }

    getCurrentSongPlaylist():playList {
        return this.playlists[this.currentSongPlaylist];
    }

    getCurrentSong(): Song {
        return this.getCurrentSongPlaylist().getSong(this.currentSong);
    }

    getCurrentSongUrl(): string {
        return this.getCurrentSongPlaylist().getSongUrl(this.currentSong);
    }

    async queueSong({ url, playlistIndex=this.botDisplayPlaylist, pos, name }: {url: string, playlistIndex?:number, pos?:number, name?: string }):Promise<number> {
        if(this.getBotDisplayPlaylist().queue.length >= MAX_PLAYLIST_SIZE) {
            throw new Error('maximum playlist size reached');
        }
        const actualPos = Math.max(0, Math.min(pos ?? this.playlists[playlistIndex].queue.length, this.playlists[playlistIndex].queue.length));
        const actualName = name === undefined || name === ''
            ? undefined
            : name;
        return ytdl.getBasicInfo(url).then(async (info) => {
            if(actualPos < this.playlists[playlistIndex].queue.length) {
                this.playlists[playlistIndex].insertSong({url, name: actualName ?? info.videoDetails.title}, actualPos);
                if(actualPos < this.currentSong) {
                    this.currentSong++;
                }
            } else {
                this.playlists[playlistIndex].insertSong({url ,name: actualName ?? info.videoDetails.title});
            }
            await this.#updateQueue(playlistIndex);
            return actualPos;
        }).catch(() => {
            throw new Error('Could not load song, url probably incorrect');
        });
    }
}