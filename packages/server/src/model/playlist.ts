import axios from 'axios';
import mongoose from 'mongoose';
import ytdl from 'ytdl-core';
import ytpl from 'ytpl';
import { Song } from '../bot/playlist';

interface IPlaylist {
    _id: string,
    name: string,
    server:string,
    queue: { name: string,  url: string}[]
}

interface IPlaylistModel extends mongoose.Model<IPlaylist> {
    findByServerId(server?:string): Promise<IPlaylist[]>,
    createNewPlayList(name: string, server:string): Promise<IPlaylist>
    createPlaylistFromUrl(name: string, server: string, url: string): Promise<IPlaylist>
}

const playListSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, "We cant have a playlist without a name!"],
    },
    server: {
        type: String,
        require: [true, "We need to link a playlist to a server"],
    },
    queue: {
        type: [
            {             
                name: {
                    type: String,
                },
                url: {
                    type: String,
                },
            },
        ],
    },
});

playListSchema.statics.findByServerId = async (server): Promise<IPlaylist[] | null> => {
    if(server) {
        const foundDay = PlayList.find({ server });
        return foundDay;
    }
    return null;
};


playListSchema.statics.createNewPlayList = async(name, server) => {
    const playList = new PlayList({
        name,
        server,
        queue: [],
    });
    return playList.save();
};

playListSchema.statics.createPlaylistFromUrl = async (name: string, server: string, url: string) => {
    const playlist = await ytpl(url);
    const songs = playlist.items.map(({ url, title }) => ({ url, name: title }));
    const promises: Promise<Song | null>[] = [];
    songs.forEach((song, index) => {
        if(index < 24) {
            promises.push(ytdl.getBasicInfo(song.url).then(() => {
                return { url: song.url, name: song.name };
            }).catch(() => {
               return null;
            }));
        }
    });
    const results = await Promise.all(promises);
    const playList = new PlayList({
        name, server,
        queue: results.filter((res) => res !== null),
    });
    await playList.save();
    console.log(playList.queue);
};




const PlayList = mongoose.model<IPlaylist, IPlaylistModel>("playList", playListSchema);
export default PlayList;