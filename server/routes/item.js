const express = require('express')
router = express.Router()
auth = require('../config/auth')
const Item = require('../model/item')

router.get('/list', async (req, res) => {
    const result = await Item.find()

    res.status(200).json(result)
})

router.get('/name', async (req, res) => {
    try {
    const result = await Item.findByName(req.query.name)
    res.status(200).json(result)
    } catch(err) {
        res.status(200).json({})
    }
})

router.get('/id', async (req, res) => {
    const result = await Item.findById(req.query.id)
    res.status(200).json(result)
})

router.put('/update', auth, async (req, res) => {
    try {
        req.body.item.name_lower = req.body.item.name.toLowerCase()
        req.body.item.edit = req.user
        await Item.findByIdAndUpdate(req.body.item._id, req.body.item)
        res.status(201).send("success")
    } catch (err) {
        res.status(400).send("something went wrong")
    }
})

router.get('/search', async (req, res) => {
    try {
        const result = await Item.findByName(req.query.name)
        res.status(200).json(result)
    } catch (err) {
        res.status(400).send("something went wrong")
    }
})


router.post('/add', auth, async (req, res) => {
    try {
        const temp = req.body.item
        const item = new Item({
            name: temp.name,
            type: temp.type,
            details: temp.details,
            edit: req.user
        })
        const result = await item.save()
        res.status(201).send("success")
    } catch (err) {
        console.log(err)
        res.status(400).send("something went wrong")
    }
})

router.delete("/delete", auth, async (req, res) => {
    try {
        await Item.findByIdAndDelete(req.query.id)
        res.status(200).send("success")
    } catch (err) {
        console.log(err)
        res.status(400).send("failure")
    }
})

module.exports = router