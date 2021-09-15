connectionManager = require('../connectionManager')
module.exports = {
    name: '?disconnect',
    description: 'Join an audio channel and play a song',
    async execute(msg, args) {
      connectionManager.clearConnection();
    }
    
}
