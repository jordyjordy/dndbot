connectionManager = require('../connectionManager')
module.exports = {
    name: '?clear',
    description: 'Clears a song (number) or all songs ("all") from the queue',
    async execute(msg, args) {
        try{
            if(args[0] === "all") {
                if(!connectionManager.clearQueue(msg.guild.id)) {
                    msg.channel.send("Something went wrong clearing the queue")
                }
            } else if(args.length > 0) {
                try {
                    var id = parseInt(args[0])
                    if(!connectionManager.removeSong(msg.guild.id,id)) {
                        msg.channel.send("The song you are trying to remove is currently being played, or does not exist!")
                    }
                } catch(err) {
                    msg.channel.send("Something went wrong clearing this item from the queue")
                }
            }
            msg.delete({timeout:100})
        } catch(err) {
            console.error(err)
        }
    }
}
