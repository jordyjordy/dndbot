
module.exports= {
    name:'?dnd',
    description:'Gives time until the next session!',
    execute(msg,args) {
        var now = new Date();
        const day = now.getDay()
        let diff = process.env.WEEKDAY - day
        if(diff < 0) {
            diff += 7
        }
        const dndDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff,process.env.HOUR,process.env.MINUTE,0)
        console.log(msg.author.username)
        let difference = dndDay.getTime() - now.getTime()
        let days = Math.floor((difference / (1000*60*60*24)) % 365)
        let hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
        let minutes = Math.floor((difference / (1000 * 60)) % 60)
        switch (diff) {
            case 0:
                if(difference <= 0) {
                    msg.channel.send(`DND IS NOW, WHAT ARE YOU WAITING FOR GO PLAY!`)
                } else {
                    msg.channel.send(`OMG OMG OMG AAAAAAAAAAH DND IS TODAY!\nONLY ${hours} HOURS AND ${minutes} MINUTES REMAINING!`)
                }
                msg.channel.send(`WEEEEEEEEEEEEEEEEEEEEEEEEEEEE`)
                break;
            case 1:
                msg.channel.send(`OMG DND IS TOMORROW!\nITS IN ONLY ${hours + 24*days} HOURS AND ${minutes} MINUTES!`);
                msg.channel.send(`AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH`)
                break;
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
                msg.channel.send(`DnD is in ${days} days, ${hours} hours and ${minutes} minutes!`)
                break;
            default: 
                //Theres not that many days in the week, we shouldnt get here
                break;

        }
        if(msg.author.username == 'itsjustjohn'){
            msg.author.send('John John John, you of all people should really know when the next session is happening!')
        }
    },
};