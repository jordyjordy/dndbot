import express, { Response } from 'express';
const router = express.Router();
import PlayList from '../model/playlist';
import sessionAuth, { ISessionAuthRequest } from '../config/sessionAuth';
import ConnectionInterface from '../util/ConnectionInterface';

type ISongDeleteRequest = ISessionAuthRequest & {
    query: {
        songIndex: number
        playlistIndex: number,
        serverId: string,
    }
};

router.post('/',sessionAuth,  async (req: ISessionAuthRequest, res: Response) => {
    try{
        const connectionInterface = new ConnectionInterface(req.body.serverId);
        const queueManager = await connectionInterface.getQueueManager(); 
        await queueManager.queueSong({ url: req.body.songUrl, name: req.body.songName, pos: req.body.songIndex, playlistIndex: req.body.playlistIndex });
        const playlists = await PlayList.findByServerId(req.body.serverId);
        res.status(201).json({ playlists });
    } catch(err) {
        console.log(err);
        res.status(400).send("Could not create");
    }
});

router.delete('/', sessionAuth, async (req: ISongDeleteRequest, res: Response) => {
    try {
        const connectionInterface = new ConnectionInterface(req.query.serverId as string);
        const queueManager = await connectionInterface.getQueueManager(); 
        const removed = await queueManager.removeSong(req.query.songIndex, req.query.playlistIndex);
        if(removed) {
            const playlists = await PlayList.findByServerId(req.query.serverId);
            res.status(201).json({ playlists });
        } else {
            res.sendStatus(400);
        }
    } catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
});

export default router;