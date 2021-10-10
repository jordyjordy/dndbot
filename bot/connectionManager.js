const ytdldisc = require('ytdl-core-discord')
const ytdl = require('ytdl-core');
var connections = {}
var dispatchers = {};
var currentsong = {};
var queues = {}
var queueMessages = {};
var queueChannels = {};
var loop = {};
var ConnectionManager = {
    setConnection(server,con) {
        connections[server] = con
    },
    clearConnection(server) {
        if(dispatchers[server]) dispatchers[server].destroy()
        if(connections[server]) connections[server].disconnect()
        delete dispatchers[server]
        delete connections[server]
    },
    getConnection(server) {
        return connections[server];
    },
    async playSong(server,id) {
        if(!queues[server]) {
            queues[server] = []
        }
        if(!currentsong[server]) {
            currentsong[server] = 0
        }
        if(!connections[server] || connections[server].status === 4) {
            return false
        }
        if(!isNaN(id)) {
            try{
                const num = parseInt(id)
                if(num >= 0 && num < queue.length) {
                    return await startSong(server, num)
                } else {
                    return false
                }
            } catch(err) {
                return false
            }
        }
        queues[server].push({url:id,name:""})
        var res =  startSong(server,queues[server].length-1)
        ytdl.getBasicInfo(id).then((info) => {
            queues[server][queues[server].length-1].name = info.videoDetails.title
        })
        return await res
    },
    queueSong(server,url,pos=queue.length) {
        return ytdl.getBasicInfo(url).then((info) => {
            if(pos < queues[server].length) {
                queues[server].splice(pos,0,{url:url,name:info.videoDetails.title})
                if(pos < currentsong[server]) {
                    currentsong[server]++
                }
            } else {
                queues[server].push({url:url,name:info.videoDetails.title})
            }
            updateQueueMessage(server)
            return true
        }).catch((err) => {
            console.error(err)
            return false
        })
    },
    currentSong(server) {
        return currentsong[server]
    },
    async nextSong(server) {
        try{
            if(!connections[server] || connections[server].status === 4) {
                return false
            }
        currentsong[server]++;
            if(currentsong[server] < queues[server].length) {
                return await startSong(server,currentsong[server])
            } else if(queues[server].length > 0) {
                return await startSong(server,0)
            }
        } catch(err) {
            console.error(err)
        }
        return false
    },
    async previousSong(server) {
        try{
            if(!connections[server] || connections[server].status === 4) {
                return false
            }
            currentsong[server]--;
            if(currentsong[server] >= 0) {
                return await startSong(server, currentsong[server])
            } else if(queues[server].length > 0) {
                currentsong[server] = queues[server].length-1
                return await startSong(server, currentsong[server])
            }
        } catch(err) {
            console.error(err)
        }
        return false
    },
    pause(server) {
        dispatchers[server].pause()
        updateQueueMessage(server) 
    },
    async play(server) {
        try{
            if(connections[server].status === 4) {
                return false
            }
            if(dispatchers[server] !== undefined) {

                try{
                    await dispatchers[server].resume()
                    updateQueueMessage(server) 
                } catch(err) {
                    console.error(err)
                }
                return
            } else if(queues[server].length !== 0 && currentsong[server] >= 0 && currentsong[server] < queues[server].length) {
                return await startSong(server, currentsong[server])
            } else if(currentsong[server] === undefined && queues[server].length > 0) {
                return await startSong(server, 0)
            }
        } catch(err) {
            console.error(err)
        }

    },
    clearQueue(server) {
        queues[server] = []
        if(dispatchers[server] !== undefined) {
            dispatchers[server].destroy()
            delete dispatchers[server]
        }
        updateQueueMessage(server)
        return true
    },
    getQueue(server) {
        if(!queues[server]) {
            queues[server] = []
        }
        if(!currentsong[server]) {
            currentsong[server] = 0
        }
        return {queue:queues[server],currentsong:currentsong[server]}
    },
    removeSong(server, id) {
        try {
            if(currentsong[server] === id && dispatchers[server] !== undefined) {
                if(!dispatchers[server].paused) {
                    return false
                } else {
                    dispatchers[server].destroy()
                    delete dispatchers[server]
                }
            }
        }  catch(err) {
            return false
        }
        queues[server].splice(id,1)
        updateQueueMessage(server) 
        return true
    },
    setQueueMessage(server,msg) {
        if(queueMessages[server]) {
            queueMessages[server].delete({timeout:100})
        }
        queueChannels[server] = msg.channel
        queueMessages[server] = msg
    },
    toggleLoop(server) {
        loop[server] = !loop[server]
        updateQueueMessage(server) 
    },
    getLoop(server) {
        return loop[server]?true:false;
    },
    getPaused(server) {
        if(dispatchers[server] !== undefined) {
            return dispatchers[server].paused
        }
        return true
    },
    clearDispatcher(server) {
        delete dispatchers[server]
    },
    async replay(server) {
        await startSong(server, currentsong[server])
    }
}

async function startSong(server,id) {
    currentsong[server] = id
    try{
        if(!connections[server]) {
            return false
        }
        if(dispatchers[server] !== undefined) {
            dispatchers[server].destroy()
            delete dispatchers[server]
        }
        dispatchers[server] = await connections[server].play(await ytdldisc(queues[server][id].url),{ type: 'opus' })
    } catch(err) {
        console.error(err)
        queues[server].splice(id,1)
        return false
    }
    updateQueueMessage(server)
    dispatchers[server].on('finish',() => {
        if(loop) {
            ConnectionManager.playSong(server, currentsong[server])
        } else {
            ConnectionManager.nextSong(server)
        }
        
    })
    return true
}

async function updateQueueMessage(server) {
    if(queueMessages[server]) {
        queueMessages[server].delete({timer:0})
        delete queueMessages[server]
    }
    if(queueChannels[server]) {
        var response = "**Paused: " + ConnectionManager.getPaused(server) + ", LoopOne: " + ConnectionManager.getLoop(server) + "**\n" 
        if(queues[server].length === 0) {
            response += "The queue is empty!"
            queueChannels[server].send(response)
            return
        }
        for(var i = 0; i < queues[server].length;i++) {
            if(i == currentsong[server]) {
                response += "**" + i + ": " + queues[server][i].name + "**" + " \n"  
            } else {
                response +=  i + ": " + queues[server][i].name + " \n"
            }     
        }
        queueMessages[server] = await queueChannels[server].send(response)
    }
}
module.exports=ConnectionManager