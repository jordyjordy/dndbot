connectionManager = require('../connectionManager')
module.exports = {
    name: '?ps',
    description: 'Play the previous song in the queue',
    async execute(msg, args) {
        connectionManager.nextSong()
        msg.delete({timeout:100})
    }
    
}
