const express = require('express')
const router = express.Router()
auth = require('../config/auth')
const Session = require('../model/session')

router.get('/', async (req, res) => {
    const result = await Session.find({server:req.query.server})
    res.status(200).json(result)

})

router.get('/list',auth, async (req, res) => {
    const result = await Session.find({server:req.server})
    res.status(200).json(result)

})

router.post('/add', auth, async (req, res) => {
    try {
        const date = new Session(req.body.day)
        date.server = req.server
        await date.save()
        res.status(201).json({ date: date, server: req.server })
    } catch (err) {
        res.status(400).send("something went wrong")
    }

})

router.put('/update', auth, async (req, res) => {
    try {
        var day = await Session.findByIdAndUpdate(req.body.day._id, req.body.day)
        day.date = req.body.day.date
        day.save()
        res.status(200).send("succes")
    } catch (err) {
        console.error(err)
        res.status(400).send("could not update")
    }
})

router.delete('/delete', auth, async (req, res) => {
    try {
        await Session.findOneAndRemove({ id: req.query.id })
        res.status(200).send("success")
    } catch (err) {
        console.error(err)
        res.status(400).send("failure")
    }
})

module.exports = router