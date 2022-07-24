import express from 'express';
const router = express.Router()
import auth from '../config/auth.js'
import PlayList from '../model/playlist.js';

router.get('/list', async (req, res) => {
    const result = await PlayList.findByServerId(req.query.server)
    res.status(200).json(result)
})

router.get('/', async (req, res) => {
    const result = await PlayList.findById(req.id);
    res.status(200).json(result)
})

router.post('/', async (req, res) => {
    try{
        const playlist = await PlayList.createNewPlayList(req.body.name, req.body.server);
        res.status(201).json({ playlist, })
    } catch(err) {
        console.log(err)
        res.status(400).send("Could not create")
    }

})

router.put('/', async (req, res) => {
    try {
        var playlist = await PlayList.findByIdAndUpdate(req.body.playlist._id, req.body.playlist, {new: true})
        res.status(201).json(playlist)
    } catch(err) {
        console.log(err)
        res.status(400).send("could not update")
    }
})

router.delete('/', async (req, res) => {
    try {
        const playlist = await PlayList.findByIdAndDelete(req.query.id)
        res.status(200).json(playlist)
    } catch(err) {
        console.log(err)
        res.status(400).send("could not delete")
    }
})

export default router;