const axios = require('axios')

module.exports = {
    name: '?info',
    description: 'Provides info about characters!',
    execute(msg, args) {
        if (!msg.content.includes("?info")) {
            var str = msg.content.split(/\s/)[0]
            args.push(str.substring(1, str.length - 1))
        }

        if (args.length == 0) {
            msg.channel.send("Please specify what you want information about, for example type `?info Villads`")
            return
        }
        var query = ""
        for (i = 0; i < args.length; i++) {
            query += args[i]
            if (i < args.length - 1) {
                query += " "
            }
        }
        try {
            axios.get(process.env.SERVER_IP + `/item/name?name=${query}`).then(function (response) {
                if (response.data.length > 0) {
                    var resultString = ``
                    for (i = 0; i < response.data.length; i++) {
                        resultString += `**Name:** ${response.data[i].name} **Type:** ${response.data[i].type} \n \n${response.data[i].details}\n`
                        if (i + 1 < response.data.length) {
                            resultString += "----------------------------------------\n"
                        }
                    }
                    msg.channel.send(resultString)

                } else {
                    msg.channel.send("No information was found with that name")
                }
            })
        } catch(err) {
            console.log(err.message)
        }

    }
};