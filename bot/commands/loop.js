connectionManager = require('../connectionManager')
module.exports = {
    name: '?loop',
    description: 'Join an audio channel and play a song',
    async execute(msg, args) {
        connectionManager.toggleLoop()
        msg.delete({timeout:100})
    }
    
}
