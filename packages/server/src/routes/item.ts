import express, { Request, Response} from 'express';
import auth from '../config/auth.js';
import Item from '../model/item.js';

const router = express.Router()

router.get('/list', auth, async (req: Request, res: Response) => {
    const result = await Item.find({server:req.server})
    res.status(200).json(result)
})

router.get('/name', async (req: Request, res: Response) => {
    try {
    const result = await Item.findByName(req.query.name as string, req.query.server as string)
    res.status(200).json(result)
    } catch(err) {
        res.status(200).json({})
    }
})

router.get('/id', auth, async (req: Request, res: Response) => {
    const result = await Item.findById(req.query.id)
    res.status(200).json(result)
})

router.put('/update', auth, async (req: Request, res:Response) => {
    try {
        req.body.item.name_lower = req.body.item.name.toLowerCase()
        req.body.item.edit = req.user
        await Item.findByIdAndUpdate(req.body.item._id, req.body.item)
        res.status(201).send("success")
    } catch (err) {
        res.status(400).send("something went wrong")
    }
})


router.get('/search', auth,  async (req: Request, res:Response) => {
    try {
        if(!req.server || !req.query.string) {
            throw new Error("Missing parameters");
        }
        const result = await Item.findByName(req.query.name as string, req.server)
        res.status(200).json(result)
    } catch (err) {
        res.status(400).send("something went wrong")
    }
})

router.post('/add', auth, async (req: Request, res: Response) => {
    try {
        const temp = req.body.item
        const item = new Item({
            name: temp.name,
            type: temp.type,
            details: temp.details,
            edit: req.user,
            server: req.server
        })
        await item.save()
        res.status(201).send("success")
    } catch (err) {
        console.log(err)
        res.status(400).send("something went wrong")
    }
})

router.delete("/delete", auth, async (req: Request, res: Response) => {
    try {
        await Item.findByIdAndDelete(req.query.id)
        res.status(200).send("success")
    } catch (err) {
        console.log(err)
        res.status(400).send("failure")
    }
})

export default router;