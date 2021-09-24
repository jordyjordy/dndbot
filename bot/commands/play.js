connectionManager = require('../connectionManager')
module.exports = {
    name: '?play',
    description: 'Join audio channel and start playing a specific song (youtube url or queue number), or unpause (no params)',
    async execute(msg, args) {
        let {voice} = msg.member
        try{
            if(!voice || !voice.channel) {
                msg.reply("You must be in a voice channel!")
                msg.delete({timeout:100})
                return
            }
            if(connectionManager.getConnection(msg.guild.id) === undefined || connectionManager.getConnection(msg.guild.id).status === 4) {
                console.log('connecting to voice channel')
                connectionManager.clearDispatcher(msg.guild.id)
                var connection = await voice.channel.join()
                await connectionManager.setConnection(msg.guild.id,connection)
            }
            if(args.length == 0) {
                if(!connectionManager.play(msg.guild.id)) {
                    msg.channel.send("Can not play a song, are you sure there is something in the queue?")     
                }
                msg.delete({timeout:100})
                return
            }

            if(!connectionManager.playSong(msg.guild.id,args[0])) {
                msg.channel.send("something went wrong, possibly you entered a bad url or number")
            }
        } catch(err) {
            console.log(err)
        }
    }
}
