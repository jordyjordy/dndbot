connectionManager = require('../connectionManager')
module.exports = {
    name: '?queue',
    description: 'Display the queue message',
    async execute(msg, args) {
        var {queue, currentsong} = await connectionManager.getQueue()
        var loop = connectionManager.getLoop()
        var paused = connectionManager.getPaused()
        var response = "**Paused: " + paused +  ", LoopOne: " + loop + "**\n" 
        if(queue.length === 0) {
            response += "The queue is empty!"
            connectionManager.setQueueMessage(await msg.channel.send(response))
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
        connectionManager.setQueueMessage(await msg.channel.send(response))
        msg.delete({timeout:100})
    }
}
