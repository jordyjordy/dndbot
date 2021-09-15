connectionManager = require('../connectionManager')
module.exports = {
    name: '?addsong',
    description: 'Adds a song to the music queue',
    async execute(msg, args) {
        if(!await connectionManager.queueSong(args[0])) {
            msg.channel.send("something went wrong, possibly you entered a bad url.")
        }
    }
}
