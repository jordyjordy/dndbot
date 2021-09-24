const axios = require('axios')

module.exports = {
    name: '?passcode',
    description: 'Request a passcode to be able to edit the database',
    execute(msg, args) {
        axios.get(process.env.SERVER_IP + `/token?user=${msg.author.username}&server=${msg.guild.id}`).then(function (response) {
            msg.author.send("Your private code is: `" + response.data.result + "`. It's valid for 3 hours!")
        }).catch((err) => {
            console.log(err)
        })
    }
}