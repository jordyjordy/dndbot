import express, { Response } from 'express';
const router = express.Router();
import userPlaylists from './userPlaylists';
import DiscordAuth, { ISessionAuthRequest } from '@jordyjordy/discord-express-auth';
import client from '../../bot';
import { LoopEnum } from '../../bot/utils/loop';
import SSEManager from '../../util/SSeManager';

router.use('/playlists', userPlaylists);

type SongPlayRequest = ISessionAuthRequest & {
    body: {
        playlist: number,
        song: number,
        serverId: string,
    }
};

type UpdateRequest = ISessionAuthRequest & {
    query: {
        serverId: string,
    }
};

type MusicAction = 'STOP' | 'PLAY' | 'PAUSE' | 'NEXTSONG' | 'PREVIOUSSONG' | 'TOGGLESHUFFLE' | 'TOGGLEREPEAT';

type MusicActionRequest = ISessionAuthRequest & {
    body: {
        action: MusicAction,
        serverId: string,
    }
};

const updateSSE = async (req, res, next) => {
    const serverId = req.query.serverId ?? req.body.serverId;
    const { connectionManager } = await client.getConnection(serverId);
    SSEManager.publish(serverId, { ...await connectionManager.getPlayStatus() });
    next();
};


router.post('/playsong', DiscordAuth.identify, async (req: SongPlayRequest, res: Response, next): Promise<void> => {
    const { connectionManager, queueManager } = await client.getConnection(req.body.serverId);
    if(!connectionManager.isConnected()) {
        await connectionManager.connectToChannel({ userId: req.sessionDetails.userId });
    }

    queueManager.selectSongFromId(req.body.song, req.body.playlist);
    await connectionManager.play(true);
    res.sendStatus(200);
    next();
}, updateSSE);

router.get('/status', DiscordAuth.identify, async (req: SongPlayRequest, res: Response): Promise<void> => {
    const { connectionManager } = await client.getConnection(req.body.serverId);
    res.status(200).send(connectionManager.getPlayStatus());
});


router.post('/action', DiscordAuth.identify, async (req: MusicActionRequest, res: Response, next): Promise<void> => {
    const { connectionManager, queueManager } = await client.getConnection(req.body.serverId);
    switch (req.body.action as MusicAction) {
        case 'STOP':
            connectionManager.clearConnection();
            break;
        case 'PLAY':
            if(!connectionManager.isConnected()) {
                await connectionManager.connectToChannel({ userId: req.sessionDetails.userId });
            }
            await connectionManager.play();
            break;
        case 'NEXTSONG':
            await connectionManager.nextSong();
            break;
        case 'PREVIOUSSONG':
            await connectionManager.previousSong();
            break;
        case 'PAUSE':
            connectionManager.pause();
            break;
        case 'TOGGLESHUFFLE':
            queueManager.toggleShuffle(!queueManager.shuffle);
            break;
        case 'TOGGLEREPEAT':
            queueManager.toggleLoop(queueManager.loop === LoopEnum.NONE ? LoopEnum.ONE : LoopEnum.NONE);
            break;
        default:
            // do nothing;
            break;
    }
    res.status(200).send(await connectionManager.getPlayStatus());
    next();
}, updateSSE);

router.get('/update', DiscordAuth.identify, async (req: UpdateRequest, res: Response) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // flush the headers to establish SSE with client

    SSEManager.addListener(req.query.serverId, req.sessionDetails.userId, (message) => {
        res.write(`\ndata: ${JSON.stringify(message)}\n\n`);
    });

    const { connectionManager } = await client.getConnection(req.query.serverId);
    res.write(`\ndata: ${JSON.stringify(await connectionManager.getPlayStatus())}\n\n`);

    // If client closes connection, stop sending events
    res.on('close', () => {
        SSEManager.removeListener(req.query.serverId, req.sessionDetails.userId);
        res.end();
    });
});

export default router;
