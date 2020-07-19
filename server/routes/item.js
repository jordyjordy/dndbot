const express = require('express')
router = express.Router()
auth = require('../config/auth')
const Item = require('../model/item')

router.get('/list', async (req,res) => {
    const result = await Item.find()
    
    res.status(200).json(result)
})

router.get('/name', async(req,res) => {
    console.log(req.query.name)
    const result = await Item.findByName(req.query.name)
    console.log(result)
    res.status(200).json(result)
})

router.get('/id', async(req,res) => {
    const result = await Item.findById(req.query.id)
    res.status(200).json(result)
})

router.put('/update', async(req,res) => {
    try{
        req.body.item.name_lower = req.body.item.name.toLowerCase()
        await Item.findByIdAndUpdate(req.body.item._id,req.body.item)
        res.status(201).send("success")
    } catch (err) {
        res.status(400).send("something went wrong")
    }
})

router.get('/search', async(req,res) => {
    try{ 
        const result = await Item.findByName(req.query.name)
        res.status(200).json(result)
    } catch(err) {
        res.status(400).send("something went wrong")
    }
})


router.post('/add',async(req,res) => {
    try{ 
        console.log("creating item")
        const temp = req.body.item
        console.log('1')
        console.log(req.body)
        const item = new Item({
            name:temp.name,
            type:temp.type,
            details:temp.details
        })
        const result = await item.save()
        res.status(201).send("success")
    } catch(err) {
        console.log(err)
        res.status(400).send("something went wrong")
    }
})

router.delete("/delete", async(req,res) => {
    try{
        await Item.findByIdAndDelete(req.query.id)
        res.status(300).send("success")
    } catch(err) {
        console.log(err)
        res.status(400).send("failure")
    }
})

module.exports = router