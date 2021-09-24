connectionManager = require('../connectionManager')
module.exports = {
    name: '?disconnect',
    description: 'Disconnect from an audio channel',
    async execute(msg, args) {
      try{
      connectionManager.clearConnection(msg.guild.id);
      msg.delete({timeout:100})
      } catch(err) {
        console.log(err)
      }
    }
    
}
