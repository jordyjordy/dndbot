connectionManager = require('../connectionManager')
module.exports = {
    name: '?loop',
    description: 'Loop the current song',
    async execute(msg, args) {
        connectionManager.toggleLoop()
        msg.delete({timeout:100})
    }
    
}
