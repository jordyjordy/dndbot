connectionManager = require('../connectionManager')
module.exports = {
    name: '?pause',
    description: 'Pause song playback',
    async execute(msg, args) {
        connectionManager.pause()
        msg.delete({timeout:100})
    }
    
}
