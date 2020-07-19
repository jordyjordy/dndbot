
module.exports= {
    name:'?dnd',
    description:'dnd!',
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
                msg.channel.send('DnD is today!')
                msg.channel.send(`Specifically in ${hours} hours and ${minutes} minutes!`)
                break;
            case 1:
                msg.channel.send('DnD is tomorrow!');
                msg.channel.send(`Specifically in ${hours + 24*days} hours and ${minutes} minutes!`)
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