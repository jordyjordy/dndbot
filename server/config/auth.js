import Token from '../model/token.js';
export default async (req, res, next) => {
    //retrieve possible tokens
    const token = req.headers.token
    try {
        //check if a token exists
        if (!token) {
            throw new Error("no valid tokens present")
        } else {
            //decode the token
            const info = await Token.findByToken(token);
            req.user = info.discord_id
            req.server = info.server_id
            next()
        }
    } catch (err) {
        res.status(401).json("Authentication Failed")
    }
}
