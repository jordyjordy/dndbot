connectionManager = require('../connectionManager')
module.exports = {
    name: '?pause',
    description: 'Pause song playback',
    async execute(msg, args) {
        try{
            connectionManager.pause(msg.guild.id)
            msg.delete({timeout:100})
        } catch(err) {
            console.error(err)
        }
        
    }
    
}
