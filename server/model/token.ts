import mongoose from 'mongoose';

interface IToken extends Document {
    discord_id: string,
    iat: number,
    server_id: string,
}

interface ITokenModel extends mongoose.Model<IToken> {
    findByToken(token: string): Promise<IToken>,
    generateToken(user:string, server:string): Promise<string>
}

const tokenSchema = new mongoose.Schema({
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

tokenSchema.statics.findByToken = async (token: string) => {
    const result = await Token.findOne({ token })
    if(!result) {
        throw new Error("token does not exist");
    }
    const secondsSinceEpoch = Math.round(Date.now() / 1000)
    if (secondsSinceEpoch - result.iat >= (parseInt(process.env.TOKEN_TIMEOUT as string))) {
        await result.remove()
        throw new Error("token no longer valid")
    }
    return result
}

tokenSchema.statics.generateToken = async (user,server) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let tokenid = ''
    const charlength = characters.length
    for (let i = 0; i < parseInt(process.env.TOKEN_LENGTH as string); i++) {
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

const Token = mongoose.model<IToken, ITokenModel>("token", tokenSchema)
export default Token;