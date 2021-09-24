connectionManager = require('../connectionManager')
module.exports = {
    name: '?ps',
    description: 'Play the previous song in the queue',
    async execute(msg, args) {
        try{
            connectionManager.nextSong()
            msg.delete({timeout:100})
        } catch(err) {
            console.log(err)
        }
        
    }
    
}
