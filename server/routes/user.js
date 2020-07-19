express = require('express')
router = express.Router()
mongoose = require("mongoose")
jwt = require("jsonwebtoken")
const User = require("../model/user")

router.post('/register', async (req, res) => {
    try{
        let isUser =  await User.find({email: req.body.email })
        if(isUser.length >= 1) {
            return res.status(409).json({
                message: "email already in use"
            })
        }
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        })
        await user.save();
        res.status(201)
        res.send()
    }
    catch (err) {
        console.log(err)
        res.status(400).json({ err: err})
    }
})

router.post('/login', async(req,res) => {
    try{
        const email = req.body.email
        const pass = req.body.password
        const long = req.body.long
        const user = await User.findByCredentials(email, pass)
        
        if(!user) {
            return res.status(401).json({ error: "Wrong credentials"})
        }
        const token = await user.generateAuthToken()
        if(long) {
            console.log("log in long")
            const longtoken = await user.generateAuthToken()
            res.status(201).json({user,token,longtoken})
        } else {
            res.status(201).json({user, token})
        }
    } catch (err) {
        console.log(err)
        res.status(400).json({err: err})
    }
})

router.delete('/logout',async(req,res) => {
    const decoded = jwt.verify(req.headers.token,process.env.SECRET)
    await User.removeToken(decoded.email, req.headers.token)
    if(req.headers.longtoken) {
        await User.removeToken(decoded.email, req.headers.longtoken)
    }
    res.status(200).json({data: "deleted"})
})
router.get('/authenticate', async(req,res) => {
    try{
        //decode the long token
        console.log("regenerating")
        const longtoken = req.headers.longtoken
        const decoded = await jwt.verify(longtoken, process.env.SECRET);
        const secondsSinceEpoch = Math.round(Date.now() / 1000) 
        //if the longtoken has timed out we need to tell the client to reconnect (log in again with credentials)
        const user = await User.findOne({email:decoded.email})
        const token = await user.generateAuthToken()
        req.userData = decoded;
        res.status(201).send(token)
    } catch(err) {
        console.log(err)
        res.status(400).send()
    }
    
})

module.exports = router