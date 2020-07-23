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
    }

})


tokenSchema.statics.findByToken = async (token) => {
    const result = await Token.findOne({token:token})
    console.log(result)
    const secondsSinceEpoch = Math.round(Date.now() / 1000)
    console.log("huh")
    if(secondsSinceEpoch - result.iat >= process.env.TOKEN_TIMEOUT) {
        console.log('token no longer valid')
        await result.remove()
        throw new Error("token no longer valid")
    } 
    return result
}

tokenSchema.statics.generateToken = async(user) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    var tokenid = ''
    const charlength = characters.length
    for(i = 0; i < process.env.TOKEN_LENGTH; i++) {
        tokenid += characters.charAt(Math.floor(Math.random() * charlength));
    }
    await Token.deleteMany({discord_id:user})
    const time = Math.round(Date.now() / 1000)
    console.log(user)
    const token = new Token({
        token:tokenid,
        discord_id:user,
        iat:time
    })
    await token.save()
    
    return tokenid

}

const Token = mongoose.model("token",tokenSchema)
module.exports = Token