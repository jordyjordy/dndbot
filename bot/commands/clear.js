connectionManager = require('../connectionManager')
module.exports = {
    name: '?clear',
    description: 'Clears a song (number) or all songs ("all") from the queue',
    async execute(msg, args) {
        try{
            if(args[0] === "all") {
                if(!connectionManager.clearQueue()) {
                    msg.channel.send("Something went wrong clearing the queue")
                }
            } else if(args.length > 0) {
                try {
                    var id = parseInt(args[0])
                    console.log(id +"," + typeof id)
                    if(!connectionManager.removeSong(id)) {
                        msg.channel.send("The song you are trying to remove is currently being played, or does not exist!")
                    }
                } catch(err) {
                    msg.channel.send("Something went wrong clearing this item from the queue")
                }
            }
            msg.delete({timeout:100})
        } catch(err) {
            console.log(err)
        }
    }
}
