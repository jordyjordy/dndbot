const jwt = require("jsonwebtoken")
const User = require("../model/user")
module.exports = async (req, res, next) => {
    console.log("VALIDATING")
    //retrieve possible tokens
    const token = req.headers.token
    try  {
        //check if a token exists
        if(!token) {
            console.log("no tokens")
            throw new Error("no valid tokens present")
        } else {
            //decode the token
            const decoded = await jwt.verify(token, process.env.SECRET);
            req.userData = decoded;
            console.log("VALIDATED")
            next()
        }
    } catch (err) {
        console.log("VALIDATION FAILED")
        res.status(401).json("Authentication Failed")
    }
}
