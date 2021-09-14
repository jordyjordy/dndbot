connectionManager = require('../connectionManager')
module.exports = {
    name: '?pause',
    description: 'Join an audio channel and play a song',
    async execute(msg, args) {
        connectionManager.pause()
        msg.delete({timeout:100})
    }
    
}
