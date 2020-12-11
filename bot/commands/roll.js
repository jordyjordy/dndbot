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

        console.log(str)
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
        console.log(bonus)
        for (var i = 0; i < dicecount; i++) {
            var roll = Math.ceil(Math.random() * dicefaces)
            if (!isNaN(bonus)) {
                roll += bonus
            }
            results.push(roll)
        }
        var resultString = "```csharp\n#" + str + ":\n"
        if (isNaN(bonus)) {
            bonus = 0
        }

        var highest = Math.max(...results)
        var lowest = Math.min(...results)
        var sum = results.reduce(sumFunc)
        if (results.length > 1) {
            resultString +=
                "highest:" + highest + "\n" +
                "lowest:" + lowest + "\n" +
                "sum:" + sum + "\n"
        } else {
            resultString += "result:" + highest + "\n"
        }

        results.forEach(x => { resultString += x + "(" + (x - bonus) + (bonus >= 0 ? "+" : "-") + bonus + ") " })
        resultString += '```'
        msg.channel.send(resultString)
    }
}

function sumFunc(total, num) {
    return total + num;
}