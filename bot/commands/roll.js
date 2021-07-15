module.exports = {
    name: '?roll',
    description: 'Roll dice in the discord chat',
    execute(msg, args) {
        var str = msg.content.slice()
        try {
            str = str.replace(/\?roll|\s|\?/g, '')
        } catch (err) {
            console.log(err)
        }

        var split = str.split(/\s|d|\+|\-/)
        var multiplier = 0;
        try {
            if (str.includes('+')) {
                multiplier += 1
            } if (str.includes('-')) {
                multiplier -= 1
            }
        } catch (err) {
            console.log(err)
        }

        var results = []
        var dicecount = split[0]
        var dicefaces = split[1]
        var bonus = split[2] * multiplier
        for (var i = 0; i < dicecount; i++) {
            var roll = Math.ceil(Math.random() * dicefaces)
            results.push(roll)
        }
        var resultString = "```csharp\n#" + str + ":\n"
        if (isNaN(bonus)) {
            bonus = 0
        }
        var highest = Math.max(...results) + bonus
        var lowest = Math.min(...results) + bonus
        var sum = results.reduce(sumFunc) + bonus
        if (results.length > 1) {
            resultString +=
                "highest:" + highest + " (" + (highest - bonus) + (bonus >= 0 ? "+" : "") + bonus + ")" + "\n" +
                "lowest:" + lowest + " (" + (lowest - bonus) + (bonus >= 0 ? "+" : "") + bonus + ")" + "\n" +
                "sum:" + sum + " ("
            results.forEach(x => { resultString += x + "+" })
            resultString = resultString.substring(0, resultString.length - 1)
            resultString += ')' + (bonus >= 0 ? "+" : "") + bonus + '```'

        } else {
            resultString += "result:" + highest + " (" + (highest - bonus) + (bonus >= 0 ? "+" : "") + bonus + ")" + "```"
        }
        msg.channel.send(resultString)
    }
}

function sumFunc(total, num) {
    return total + num;
}