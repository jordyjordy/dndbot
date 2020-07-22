
module.exports= {
    name:'?dnd',
    description:'Gives time until the next session!',
    execute(msg,args) {
        console.log("HI!")
        var now = new Date();
        const day = now.getDay()
        let diff = process.env.WEEKDAY - day
        if(diff < 0) {
            diff += 7
        }
        const dndDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff,process.env.HOUR,process.env.MINUTE,0)
        let difference = dndDay.getTime() - now.getTime()
        let days = Math.floor((difference / (1000*60*60*24)) % 365)
        let hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
        let minutes = Math.floor((difference / (1000 * 60)) % 60)
        console.log("hey")
        switch (diff) {
            case 0:
                msg.channel.send(`OMG OMG OMG AAAAAAAAAAH DND IS TODAY!\nONLY ${hours} HOURS AND ${minutes} MINUTES REMAINING!`)
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
                console.log(diff)
                console.log("huh")
                //Theres not that many days in the week, we shouldnt get here
                break;

        }
    },
};