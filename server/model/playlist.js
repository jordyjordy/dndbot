import mongoose from 'mongoose';

const playListSchema = mongoose.Schema({
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

playListSchema.statics.findByServerId = async (server) => {
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




const PlayList = mongoose.model("playList", playListSchema)
export default PlayList;