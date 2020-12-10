
const axios = require('axios')

module.exports = {
    name: '?dnd',
    description: 'Gives time until the next session!',
    execute(msg, args) {
        var now = new Date();
        const nowTime = now.getTime()
        axios.get(process.env.SERVER_IP + `/sessions`).then(function (response) {
            var dndDay = Infinity;
            response.data.forEach(day => {
                if (nowTime < day.date) {
                    if (day.date - nowTime < dndDay - nowTime) {
                        dndDay = day.date;
                    }
                }
            });
            if (dndDay == Infinity) {
                msg.channel.send(`There is currently no planned date for the next session!`)
                return
            }
            let difference = dndDay - nowTime;
            let days = Math.floor((difference / (1000 * 60 * 60 * 24)) % 365)
            let hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
            let minutes = Math.floor((difference / (1000 * 60)) % 60)
            var diff = new Date(dndDay).getDay() - new Date(nowTime).getDay()
            if (diff < 0) {
                diff += 7;
            }
            if (days > 3) {
                msg.channel.send(`DnD is in ${days} days, ${hours} hours and ${minutes} minutes!`)
                return;
            }
            switch (diff) {
                case 0:
                    if (difference <= 0) {
                        msg.channel.send(`DND IS NOW, WHAT ARE YOU WAITING FOR GO PLAY!`)
                    } else {
                        msg.channel.send(`OMG OMG OMG AAAAAAAAAAH DND IS TODAY!\nONLY ${hours} HOURS AND ${minutes} MINUTES REMAINING!`)
                    }
                    msg.channel.send(`WEEEEEEEEEEEEEEEEEEEEEEEEEEEE`)
                    break;
                case 1:
                    msg.channel.send(`OMG DND IS TOMORROW!\nITS IN ONLY ${hours + 24 * days} HOURS AND ${minutes} MINUTES!`);
                    msg.channel.send(`AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH`)
                    break;
                default:
                    msg.channel.send(`DnD is in ${days} days, ${hours} hours and ${minutes} minutes!`)
                    break;
            }
        })
    },
};