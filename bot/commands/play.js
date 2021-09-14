connectionManager = require('../connectionManager')
module.exports = {
    name: '?play',
    description: 'Join an audio channel and play a song',
    async execute(msg, args) {
        let {voice} = msg.member
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
        if(!voice || !voice.channel) {
            msg.reply("You must be in a voice channel!")
            msg.delete({timeout:100})
            return
        }
        if(!connectionManager.playSong(args[0])) {
            msg.channel.send("something went wrong, possibly you entered a bad url or number")
        }
        msg.delete({timeout:100})
    }
    
}
