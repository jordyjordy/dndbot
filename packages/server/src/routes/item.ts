import express, { Request, Response} from 'express';
import Item from '../model/item';
import DiscordAuth, { ISessionAuthRequest } from '@thepineappledev/discord-express-auth';

const router = express.Router();

interface RequestWithServer extends ISessionAuthRequest {
    query: {
        serverId: string
    }
}

router.get('/list', DiscordAuth.identify, async (req: RequestWithServer, res: Response) => {
    const result = await Item.find({server:req.query.serverId});
    res.status(200).json(result);
});

router.get('/name', async (req: Request, res: Response) => {
    try {
        const result = await Item.findByName(req.query.name as string, req.query.serverId as string);
        res.status(200).json(result);
    } catch(err) {
        res.status(200).json({});
    }
});

router.get('/id', DiscordAuth.identify, async (req: ISessionAuthRequest, res: Response) => {
    const result = await Item.findById(req.query.id);
    res.status(200).json(result);
});

router.put('/update', DiscordAuth.identify, async (req: ISessionAuthRequest, res:Response) => {
    try {
        req.body.item.name_lower = req.body.item.name.toLowerCase();
        req.body.item.edit = req.sessionDetails.userId;
        await Item.findByIdAndUpdate(req.body.item._id, req.body.item);
        res.status(201).send("success");
    } catch (err) {
        res.status(400).send("something went wrong");
    }
});


router.get('/search', DiscordAuth.identify,  async (req: ISessionAuthRequest, res:Response) => {
    try {
        if(!req.body.server || !req.query.string) {
            throw new Error("Missing parameters");
        }
        const result = await Item.findByName(req.query.name as string, req.body.server);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).send("something went wrong");
    }
});

router.post('/add', DiscordAuth.identify, async (req: ISessionAuthRequest, res: Response) => {
    try {
        const temp = req.body.item;
        const item = new Item({
            name: temp.name,
            type: temp.type,
            details: temp.details,
            edit: req.sessionDetails?.userId,
            server: req.body.serverId,
        });
        await item.save();
        res.status(201).send("success");
    } catch (err) {
        console.log(err);
        res.status(400).send("something went wrong");
    }
});

router.delete("/delete", DiscordAuth.identify, async (req: ISessionAuthRequest, res: Response) => {
    try {
        await Item.findByIdAndDelete(req.query.id);
        res.status(200).send("success");
    } catch (err) {
        console.log(err);
        res.status(400).send("failure");
    }
});

export default router;