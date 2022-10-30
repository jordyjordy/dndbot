import express, {Request, Response } from 'express';
const router = express.Router()
import auth, { IAuthRequest } from '../config/auth.js'
import Session from '../model/session.js';

router.get('/', async (req: Request, res: Response) => {
    const result = await Session.find({server:req.query.server as string})
    res.status(200).json(result)

})

router.get('/list', auth, async (req: IAuthRequest, res: Response) => {
    const result = await Session.find({server:req.server})
    res.status(200).json(result)

})


router.post('/add', auth, async (req: IAuthRequest, res: Response) => {
    try {
        const date = new Session(req.body.day)
        date.server = req.server
        await date.save()
        res.status(201).json({ date: date, server: req.server })
    } catch (err) {
        res.status(400).send("something went wrong")
    }

})

router.put('/update', auth, async (req: IAuthRequest, res: Response) => {
    try {
        const day = await Session.findByIdAndUpdate(req.body.day._id, req.body.day)
        if(day) {
            day.date = req.body.day.date
            day.save()
            res.status(200).send("succes")
        } else {
            throw new Error("could not find day");
        }
    } catch (err) {
        console.error(err)
        res.status(400).send("could not update")
    }
})

router.delete('/delete', auth, async (req: IAuthRequest, res: Response) => {
    try {
        await Session.findOneAndRemove({ id: req.query.id as string })
        res.status(200).send("success")
    } catch (err) {
        console.error(err)
        res.status(400).send("failure")
    }
})

export default router;