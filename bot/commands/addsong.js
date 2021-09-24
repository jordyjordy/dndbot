connectionManager = require('../connectionManager')
module.exports = {
    name: '?addsong',
    description: 'Adds a song to the music queue, optional param to indicate the index',
    async execute(msg, args) {
        console.log(msg.guild.id)
        try{
            if(args.length > 1) {
                if(!await connectionManager.queueSong(msg.guild.id,args[0],args[1])) {
                    msg.channel.send("something went wrong, possibly you entered a bad url.")
                }
            } else {
                if(!await connectionManager.queueSong(msg.guild.id,args[0])) {
                    msg.channel.send("something went wrong, possibly you entered a bad url.")
                }
            }
        } catch(err) {
            console.log(err)
        }
    }
}
