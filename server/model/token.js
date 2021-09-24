const mongoose = require('mongoose')

tokenSchema = mongoose.Schema({
    token: {
        type: String
    },
    discord_id: {
        type: String
    },
    iat: {
        type: Number
    },
    server_id: {
        type: String
    }

})

tokenSchema.statics.findByToken = async (token) => {
    const result = await Token.findOne({ token: token })
    const secondsSinceEpoch = Math.round(Date.now() / 1000)
    if (secondsSinceEpoch - result.iat >= process.env.TOKEN_TIMEOUT) {
        await result.remove()
        throw new Error("token no longer valid")
    }
    return result
}

tokenSchema.statics.generateToken = async (user,server) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    var tokenid = ''
    const charlength = characters.length
    for (i = 0; i < process.env.TOKEN_LENGTH; i++) {
        tokenid += characters.charAt(Math.floor(Math.random() * charlength));
    }
    await Token.deleteMany({ discord_id: user })
    const time = Math.round(Date.now() / 1000)
    const token = new Token({
        token: tokenid,
        discord_id: user,
        server_id: server,
        iat: time
    })
    await token.save()

    return tokenid

}

const Token = mongoose.model("token", tokenSchema)
module.exports = Token