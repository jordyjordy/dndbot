connectionManager = require('../connectionManager')
module.exports = {
    name: '?loop',
    description: 'Toggle Looping the current song',
    async execute(msg, args) {
        connectionManager.toggleLoop(msg.guild.id)
        msg.delete({timeout:100})
    }
    
}
