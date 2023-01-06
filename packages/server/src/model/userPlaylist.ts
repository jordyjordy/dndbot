import mongoose from 'mongoose';

interface IUserPlaylist {
    _id: string,
    name: string,
    userId:string,
    queue: { name: string,  url: string}[]
}

interface IUserPlaylistModel extends mongoose.Model<IUserPlaylist> {
    findByUserId(userId:string): Promise<IUserPlaylist[]>,
    createNewPlayList(name: string, userId:string): Promise<IUserPlaylist>
}

const playListSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, "We cant have a playlist without a name!"],
    },
    userId: {
        type: String,
        require: [true, "We need to link a userPlaylist to a user"],
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

playListSchema.statics.findByUserId = async (userId: string): Promise<IUserPlaylist[]> => {
    const playlists = UserPlayList.find({ userId }, { name: 1 });
    return playlists;
};

playListSchema.statics.createNewPlayList = async(name:string, userId: string) => {
    const playList = new UserPlayList({
        name,
        userId,
        queue: [],
    });
    return playList.save();
};

const UserPlayList = mongoose.model<IUserPlaylist, IUserPlaylistModel>("userPlayList", playListSchema);
export default UserPlayList;
