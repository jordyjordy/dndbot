connectionManager = require('../connectionManager')
module.exports = {
    name: '?disconnect',
    description: 'Disconnect from an audio channel',
    async execute(msg, args) {
      connectionManager.clearConnection();
      msg.delete({timeout:100})
    }
    
}
