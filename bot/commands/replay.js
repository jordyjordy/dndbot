connectionManager = require('../connectionManager')
module.exports = {
    name: '?replay',
    description: 'Restart the current song',
    async execute(msg, args) {
        await connectionManager.replay()
        msg.destroy({timer:500})
    }
}
