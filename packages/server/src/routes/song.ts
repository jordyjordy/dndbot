import express, { Response } from 'express';
const router = express.Router();
import PlayList from '../model/playlist';
import client from '../bot';
import DiscordAuth, { ISessionAuthRequest } from '@jordyjordy/discord-express-auth';

type ISongDeleteRequest = ISessionAuthRequest & {
    query: {
        songIndex: number
        playlistId: string,
        serverId: string,
    }
};

router.post('/', DiscordAuth.identify, async (req: ISessionAuthRequest, res: Response) => {
    try{
        const { queueManager } = await client.getConnection(req.body.serverId);
        const playlistIndex = queueManager.getIndexOfPlaylistById(req.body.playlistId);
        await queueManager.queueSong({ url: req.body.songUrl, name: req.body.songName, pos: req.body.songIndex, playlistIndex });
        const playlists = await PlayList.findByServerId(req.body.serverId);
        res.status(201).json({ playlists });
    } catch(err) {
        console.log(err);
        res.status(400).send("Could not create");
    }
});

router.put('/', DiscordAuth.identify, async (req: ISessionAuthRequest, res: Response) => {
    try {
        const { queueManager } = await client.getConnection(req.body.serverId);
        const playlistIndex = queueManager.getIndexOfPlaylistById(req.body.playlistId);
        await queueManager.updateSong(req.body.song, playlistIndex);
        const playlists = await PlayList.findByServerId(req.body.serverId);
        res.status(200).send({ playlists });
    } catch {
        res.sendStatus(400);
    }
});

router.delete('/', DiscordAuth.identify, async (req: ISongDeleteRequest, res: Response) => {
    try {
        const { queueManager } = await client.getConnection(req.query.serverId as string); 
        const playlistIndex = queueManager.getIndexOfPlaylistById(req.query.playlistId);
        const removed = await queueManager.removeSong(req.query.songIndex, playlistIndex);
        queueManager.updatePlaylists();
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