const ytdldisc = require('ytdl-core-discord')
const ytdl = require('ytdl-core');
var connection;
var dispatcher;
var currentsong;
var queue = []
var queueMessage;
var loop = false;
var ConnectionManager = {
    setConnection(con) {
        connection = con;
    },
    clearConnection() {
        connection = undefined
    },
    getConnection() {
        return connection;
    },
    async playSong(id) {
        if(!isNaN(id)) {
            console.log('is a number?')
            try{
                const num = parseInt(id)
                if(num >= 0 && num < queue.length) {
                    console.log('starting song: '+num)
                    return await startSong(num)
                } else {
                    return false
                }
            } catch(err) {
                console.log(err)
                console.log("err caught?")
                return false
            }
        }
        queue.push({url:id,name:""})
        var res =  startSong(queue.length-1)
        ytdl.getBasicInfo(id).then((info) => {

            queue[queue.length-1].name = info.videoDetails.title
        })
        return await res
    },
    queueSong(url) {
        return ytdl.getBasicInfo(url).then((info) => {
            queue.push({url:url,name:info.videoDetails.title})
            updateQueueMessage()
            return true
        }).catch((err) => {
            console.log(err)
            return false
        })
    },
    currentSong() {
        return currentsong
    },
    async nextSong() {
       currentsong++;
        if(currentsong < queue.length) {
            return await startSong(currentsong)
        } else if(queue.length > 0) {
            return await startSong(0)
        }
        return false
    },
    async previousSong() {
        currentsong--;
        if(currentsong >= 0) {
            return await startSong(currentsong)
        } else if(queue.length > 0) {
            currentsong = queue.length-1
            return await startSong(currentsong)
        }
        return false
    },
    pause() {
        dispatcher.pause()
        updateQueueMessage() 
    },
    async play() {
        if(dispatcher !== undefined) {
            console.log("resuming")
            try{
                await dispatcher.resume()
                updateQueueMessage() 
            } catch(err) {
                console.log(err)
            }
            return
        } else if(queue.length !== 0 && currentsong >= 0 && currentsong < queue.length) {
            return await startSong(currentsong)
        } else if(currentsong === undefined && queue.length > 0) {
            return await startSong(0)
        }

    },
    clearQueue() {
        queue = []
        if(dispatcher !== undefined) {
            dispatcher.destroy()
            dispatcher = undefined;
        }
        updateQueueMessage()
        return true
    },
    getQueue() {
        return {queue:queue,currentsong:currentsong}
    }, removeSong(id) {
        try {
            console.log(currentsong +"," + id)
            console.log(typeof currentsong +"," + typeof id)
            if(currentsong === id && dispatcher !== undefined) {
                if(!dispatcher.paused) {
                    return false
                } else {
                    dispatcher.destroy()
                    dispatcher = undefined
                }
            }
        }  catch(err) {
            return false
        }
        queue.splice(id,1)
        updateQueueMessage() 
        return true
    },
    setQueueMessage(msg) {
        queueMessage = msg;
    },
    toggleLoop() {
        loop = !loop
        updateQueueMessage() 
    },
    getLoop() {
        return loop;
    },
    getPaused() {
        if(dispatcher !== undefined) {
            return dispatcher.paused
        }
        return true
    }
}

async function startSong(id) {
    console.log('starting song '+ id)
    currentsong = id
    try{
        if(!connection) {
            return false
        }
        if(dispatcher !== undefined) dispatcher.destroy()
        dispatcher = await connection.play(await ytdldisc(queue[id].url),{ type: 'opus' })
    } catch(err) {
        console.log(err)
        queue.splice(id,1)
        return false
    }
    updateQueueMessage()
    dispatcher.on('finish',() => {
        if(loop) {
            ConnectionManager.playSong(currentsong)
        } else {
            ConnectionManager.nextSong()
        }
        
    })
    return true
}

async function updateQueueMessage() {
    if(queueMessage) {
        var response = "**Paused: " + ConnectionManager.getPaused() + ", LoopOne: " + loop + "**\n" 
        if(queue.length === 0) {
            response += "The queue is empty!"
            queueMessage.edit(response)
            return
        }
        for(var i = 0; i < queue.length;i++) {
            if(i == currentsong) {
                response += "**" + i + ": " + queue[i].name + "**" + " \n"  
            } else {
                response +=  i + ": " + queue[i].name + " \n"
            }     
        }
        queueMessage.edit(response)
    }
}
module.exports=ConnectionManager