import express, { Response } from 'express';
const router = express.Router();
import userPlaylists from './userPlaylists';
import sessionAuth, { ISessionAuthRequest } from '../../config/sessionAuth';
import { getConnection } from '../../bot';
import ConnectionInterface from '../../util/ConnectionInterface';
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
    const connectionInterface = new ConnectionInterface(serverId);
    SSEManager.publish(serverId, { ...await connectionInterface.getPlayStatus() });
    next();
};


router.post('/playsong', sessionAuth, async (req: SongPlayRequest, res: Response, next): Promise<void> => {
    await getConnection(req.body.serverId);
    const connectionInterface = new ConnectionInterface(req.body.serverId);
    const connectionManager = await connectionInterface.getConnectionManager();
    const queueManager = await connectionInterface.getQueueManager();
    if(!connectionManager.isConnected()) {
        await connectionInterface.joinVoiceChannel(req.sessionDetails.userId);
    }

    queueManager.selectSongFromId(req.body.song, req.body.playlist);
    await connectionManager.play(true);
    res.sendStatus(200);
    next();
}, updateSSE);

router.get('/status', sessionAuth, async (req: SongPlayRequest, res: Response): Promise<void> => {
    const connectionInterface = new ConnectionInterface(req.body.serverId);
    res.status(200).send(connectionInterface.getPlayStatus());
});


router.post('/action', sessionAuth, async (req: MusicActionRequest, res: Response, next): Promise<void> => {
    const connection = await getConnection(req.body.serverId);
    const connectionInterface = new ConnectionInterface(req.body.serverId);
    switch (req.body.action as MusicAction) {
        case 'STOP':
            connection.connectionManager.clearConnection();
            break;
        case 'PLAY':
            if(!connection.connectionManager.isConnected()) {
                await connectionInterface.joinVoiceChannel(req.sessionDetails.userId);
            }
            await connection.connectionManager.play();
            break;
        case 'NEXTSONG':
            await connection.connectionManager.nextSong();
            break;
        case 'PREVIOUSSONG':
            await connection.connectionManager.previousSong();
            break;
        case 'PAUSE':
            connection.connectionManager.pause();
            break;
        case 'TOGGLESHUFFLE':
            connection.queueManager.toggleShuffle(!connection.queueManager.shuffle);
            break;
        case 'TOGGLEREPEAT':
            connection.queueManager.toggleLoop(connection.queueManager.loop === LoopEnum.NONE ? LoopEnum.ONE : LoopEnum.NONE);
            break;
        default:
            // do nothing;
            break;
    }
    res.status(200).send(await connectionInterface.getPlayStatus());
    next();
}, updateSSE);

router.get('/update', sessionAuth, async (req: UpdateRequest, res: Response) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // flush the headers to establish SSE with client

    SSEManager.addListener(req.query.serverId, req.sessionDetails.userId, (message) => {
        res.write(`\ndata: ${JSON.stringify(message)}\n\n`);
    });

    const connectionInterface = new ConnectionInterface(req.query.serverId);
    res.write(`\ndata: ${JSON.stringify(await connectionInterface.getPlayStatus())}\n\n`);

    // If client closes connection, stop sending events
    res.on('close', () => {
        console.log('closing');
        SSEManager.removeListener(req.query.serverId, req.sessionDetails.userId);
        res.end();
    });
});

export default router;
