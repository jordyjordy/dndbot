connectionManager = require('../connectionManager')
module.exports = {
    name: '?ps',
    description: 'Join an audio channel and play a song',
    async execute(msg, args) {
        connectionManager.nextSong()
        msg.delete({timeout:100})
    }
    
}
