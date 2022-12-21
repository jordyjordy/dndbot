import mongoose from 'mongoose';

interface IPlaylist {
    _id: string,
    name: string,
    server:string,
    queue: { name: string,  url: string}[]
}

interface IPlaylistModel extends mongoose.Model<IPlaylist> {
    findByServerId(server:string): Promise<IPlaylist[]>,
    createNewPlayList(name: string, server:string): Promise<IPlaylist>
}

const playListSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, "We cant have a playlist without a name!"]
    },
    server: {
        type: String,
        require: [true, "We need to link a playlist to a server"]
    },
    queue: {
        type: [
            {             
                name: {
                    type: String,
                },
                url: {
                    type: String
                }
            }
        ]
    }
})

playListSchema.statics.findByServerId = async (server): Promise<IPlaylist[]> => {
    const foundDay = PlayList.find({ server })
    return foundDay;
}

playListSchema.statics.createNewPlayList = async(name, server) => {
    const playList = new PlayList({
        name,
        server,
        queue: [],
    })
    return playList.save()
}




const PlayList = mongoose.model<IPlaylist, IPlaylistModel>("playList", playListSchema)
export default PlayList;