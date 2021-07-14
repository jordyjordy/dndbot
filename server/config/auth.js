const Item = require('../model/token')
module.exports = async (req, res, next) => {
    //retrieve possible tokens
    console.log(req.headers.token)
    const token = req.headers.token
    try {
        //check if a token exists
        if (!token) {
            throw new Error("no valid tokens present")
        } else {
            //decode the token
            const info = await Item.findByToken(token);
            req.user = info.discord_id
            next()
        }
    } catch (err) {
        res.status(401).json("Authentication Failed")
    }
}
