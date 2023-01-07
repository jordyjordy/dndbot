import express, { Request, Response } from 'express';
const router = express.Router();
import PlayList from '../model/playlist';
import sessionAuth from '../config/sessionAuth';import ConnectionInterface from '../util/ConnectionInterface';


router.get('/list', sessionAuth, async (req: Request, res: Response) => {
    const result = await PlayList.findByServerId(req.query.server as string);
    res.status(200).json(result);
});

router.post('/',sessionAuth, async (req: Request, res: Response) => {
    const connectionInterface = new ConnectionInterface(req.body.serverId);
    try{
        if(req.body.url) {
            await PlayList.createPlaylistFromUrl(req.body.name, req.body.serverId, req.body.url);
            
        } else {
            await PlayList.createNewPlayList(req.body.name, req.body.serverId);

        }
        await (await connectionInterface.getQueueManager()).updatePlaylists();
        const playlists = await PlayList.findByServerId(req.body.serverId);
        res.status(201).json({ playlists });
    } catch(err) {
        console.log(err);
        res.status(400).send("Could not create");
    }
});


router.put('/', sessionAuth, async (req: Request, res: Response) => {
    try {
        await PlayList.findByIdAndUpdate(req.body.playlist._id, req.body.playlist, {new: true});
        const playlists = await PlayList.findByServerId(req.body.serverId);
        res.status(201).json({ playlists });
    } catch(err) {
        console.error(err);
        res.status(400).send("could not update");
    }
});

router.delete('/', sessionAuth, async (req: Request, res: Response) => {
    try {
        await PlayList.findByIdAndDelete(req.query.playlistId);
        const playlists = await PlayList.findByServerId(req.query.serverId as string);
        res.status(201).json({ playlists });
    } catch(err) {
        console.error(err);
        res.status(400).send("could not delete");
    }
});

export default router;