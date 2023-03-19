import express, { Request, Response } from 'express';
const router = express.Router();
import PlayList from '../model/playlist';
import sessionAuth from '../config/sessionAuth';
import SSEManager from '../util/SSeManager';
import client from '../bot';

const updateSSE = async (req, res, next) => {
    const serverId = req.query.serverId ?? req.body.serverId;
    const { connectionManager } = await client.getConnection(serverId);
    SSEManager.publish(serverId, { ...await connectionManager.getPlayStatus() });
    next();
};

router.get('/list', sessionAuth, async (req: Request, res: Response) => {
    const result = await PlayList.findByServerId(req.query.server as string);
    res.status(200).json(result);
});

router.post('/',sessionAuth, async (req: Request, res: Response) => {
    const { queueManager } = await client.getConnection(req.body.serverId);
    try{
        if(req.body.url) {
            await PlayList.createPlaylistFromUrl(req.body.name, req.body.serverId, req.body.url);
            
        } else {
            await PlayList.createNewPlayList(req.body.name, req.body.serverId);

        }
        await queueManager.updatePlaylists();
        const playlists = await PlayList.findByServerId(req.body.serverId);
        res.status(201).json({ playlists });
    } catch(err) {
        console.log(err);
        res.status(400).send("Could not create");
    }
});


router.put('/', sessionAuth, async (req: Request, res: Response, next) => {
    try {
        const { queueManager } = await client.getConnection(req.body.serverId);
        const oldPlaylist = await PlayList.findByIdAndUpdate(req.body.playlist._id, req.body.playlist);
        queueManager.updatePlaylists();
        if (queueManager.getCurrentSongPlaylist()._id == req.body.playlist._id) {
            const currentSong = oldPlaylist?.queue[queueManager.currentSong];
            const newPlaylist = await PlayList.findById(req.body.playlist._id);
            const newSongIndex = newPlaylist?.queue.findIndex(({ _id }) => {
                return _id?.toString() == currentSong?._id?.toString();
            }) ?? queueManager.currentSong;
            queueManager.currentSong = newSongIndex;
        }
        const playlists = await PlayList.findByServerId(req.body.serverId);
        res.status(201).json({ playlists });
        next();
    } catch(err) {
        console.error(err);
        res.status(400).send("could not update");
    }
}, updateSSE);

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