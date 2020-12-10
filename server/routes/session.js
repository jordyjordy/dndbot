const express = require('express')
const router = express.Router()
auth = require('../config/auth')
const Session = require('../model/session')

router.get('/', async (req, res) => {
    const result = await Session.find()
    console.log(result)
    res.status(200).json(result)

})

router.post('/add', auth, async (req, res) => {
    try {
        const date = new Session(req.body.day)
        await date.save()
        res.status(201).send("success")
    } catch (err) {
        console.log(err)
        res.status(400).send("something went wrong")
    }

})

router.put('/update', auth, async (req, res) => {
    try {
        console.log(req.body)
        await Session.findByIdAndUpdate(req.body.day._id, req.body.day)
        res.status(200).send("succes")
    } catch (err) {
        console.log(err)
        res.status(400).send("could not update")
    }
})

router.delete('/delete', auth, async (req, res) => {
    try {
        console.log("removing session");
        console.log(req.query);
        await Session.findOneAndRemove({ id: req.query.id })
        res.status(200).send("success")
    } catch (err) {
        console.log(err)
        res.status(400).send("failure")
    }
})

module.exports = router