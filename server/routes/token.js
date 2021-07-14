const express = require('express')
const router = express.Router()
const Token = require('../model/token')
const e = require('express')


router.get('/', async (req, res) => {
    const result = await Token.generateToken(req.query.user)
    res.status(200).json({ result })
})

router.get('/validate', async (req, res) => {
    try {
        const token = await Token.findOne({ token: req.query.token })
        if (token == null) {
            res.status(200).json(false)
        } else {
            res.status(200).json(true)
        }
    } catch (err) {
        res.status(200).json(false)
    }
})

router.delete('/clear', async (req, res) => {
    try {
        await Token.deleteOne({ token: req.query.token })
        res.status(200).send()
    } catch (err) {
        res.status(400).send()
    }
})
module.exports = router