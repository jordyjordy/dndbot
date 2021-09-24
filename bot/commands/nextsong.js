connectionManager = require('../connectionManager')
module.exports = {
    name: '?ns',
    description: 'Play the next song in the queue',
    async execute(msg, args) {
        try {
            connectionManager.nextSong()
            msg.delete({timeout:100})
        } catch(err) {
            console.log(err)
        }
        
    }
    
}
