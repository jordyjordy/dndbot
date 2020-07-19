const axios = require('axios')

module.exports = {
    name: '?info',
    description: 'info!',
    execute(msg,args) {
        if(args.length == 0) {
            msg.channel.send("Please specify what you want information about, for example type `?info Villads`")
            return
        }
        console.log(args[0])
        axios.get(process.env.SERVER_IP+ `/item/name?name=${args[0]}`).then(function(response){
            console.log(response.data[0])
            if(response.data.length > 0){
                var resultString = ``
                for(i = 0; i < response.data.length; i++) {
                    resultString += `**Name:** ${response.data[i].name} **Type:** ${response.data[i].type} \n \n${response.data[i].details}\n`
                    if(i+1 < response.data.length) {
                        resultString += "----------------------------------------\n"
                    }
                }
                msg.channel.send(resultString)

            } else {
                msg.channel.send("No information was found with that name")
            }
        })

    }
};