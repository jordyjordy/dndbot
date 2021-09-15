connectionManager = require('../connectionManager')
module.exports = {
    name: '?ns',
    description: 'Join an audio channel and play a song',
    async execute(msg, args) {
        connectionManager.nextSong()
        msg.delete({timeout:100})
    }
    
}
