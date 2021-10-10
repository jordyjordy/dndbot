connectionManager = require('../connectionManager')
module.exports = {
    name: '?replay',
    description: 'Restart the current song',
    async execute(msg, args) {
        try{
            await connectionManager.replay()
            msg.delete({timer:500})
        } catch(err) {
            console.error(err)
        }
        
    }
}
