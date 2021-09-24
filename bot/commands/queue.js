connectionManager = require('../connectionManager')
module.exports = {
    name: '?queue',
    description: 'Display the queue message',
    async execute(msg, args) {
        try{
            console.log(msg.guild.id)
            var {queue, currentsong} = await connectionManager.getQueue(msg.guild.id)
            var loop = connectionManager.getLoop(msg.guild.id)
            var paused = connectionManager.getPaused(msg.guild.id)
            var response = "**Paused: " + paused +  ", LoopOne: " + loop + "**\n" 
            if(queue.length === 0) {
                response += "The queue is empty!"
                connectionManager.setQueueMessage(msg.guild.id,await msg.channel.send(response))
                msg.delete({timeout:100})
                return
            }
            for(var i = 0; i < queue.length;i++) {
                if(i == currentsong) {
                    response += "**" + i + ": " + queue[i].name + "**" + " \n"  
                } else {
                    response +=  i + ": " + queue[i].name + " \n"
                }     
            }
            connectionManager.setQueueMessage(msg.guild.id,await msg.channel.send(response))
            msg.delete({timeout:100})
        } catch(err) {
            console.log(err)
        }
    }
}
