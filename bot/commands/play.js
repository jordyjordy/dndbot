connectionManager = require('../connectionManager')
module.exports = {
    name: '?play',
    description: 'Join audio channel and start playing a specific song (youtube url or queue number), or unpause (no params)',
    async execute(msg, args) {
        let {voice} = msg.member
        if(!voice || !voice.channel) {
            msg.reply("You must be in a voice channel!")
            msg.delete({timeout:100})
            return
        }
        if(connectionManager.getConnection() === undefined || connectionManager.getConnection().status === 4) {
            connectionManager.clearDispatcher()
            var connection = await voice.channel.join()
            await connectionManager.setConnection(connection)
        }
        if(args.length == 0) {
            if(!connectionManager.play()) {
                msg.channel.send("Can not play a song, are you sure there is something in the queue?")     
            }
            msg.delete({timeout:100})
            return
        }

        if(!connectionManager.playSong(args[0])) {
            msg.channel.send("something went wrong, possibly you entered a bad url or number")
        }
    }
}
