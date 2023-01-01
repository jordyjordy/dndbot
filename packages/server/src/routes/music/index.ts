import express, { Response } from 'express';
const router = express.Router();
import playlists from './playlists';
import sessionAuth, { ISessionAuthRequest } from '../../config/sessionAuth';
import { getConnection } from '../../bot';
import ConnectionInterface from '../../util/ConnectionInterface';
import { LoopEnum } from '../../bot/utils/loop';
import SSEManager from '../../util/SSeManager';

router.use('/playlists', playlists);

type SongPlayRequest = ISessionAuthRequest & {
    query: {
        playlistId: number,
        songId: number,
        serverId: string,
    }
}

type MusicAction = 'STOP' | 'PLAY' | 'PAUSE' | 'NEXTSONG' | 'PREVIOUSSONG' | 'TOGGLESHUFFLE' | 'TOGGLEREPEAT';

type MusicActionRequest = ISessionAuthRequest & {
    body: {
        action: MusicAction,
        serverId: string,
    }
}

router.get('/playsong', sessionAuth, async (req: SongPlayRequest, res: Response): Promise<void> => {
    const connection = await getConnection(req.query.serverId);
    connection.queueManager.setPlayList(req.query.playlistId);
    connection.queueManager.selectSong(req.query.songId);
    connection.connectionManager.play();
    res.sendStatus(200);
})

router.get('/status', sessionAuth, async (req: SongPlayRequest, res: Response): Promise<void> => {
    const connectionInterface = new ConnectionInterface(req.body.serverId);
    res.status(200).send(connectionInterface.getPlayStatus())
})


router.post('/action', sessionAuth, async (req: MusicActionRequest, res: Response): Promise<void> => {
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
    SSEManager.publish(req.body.serverId, await connectionInterface.getPlayStatus());
    res.status(200).send(await connectionInterface.getPlayStatus());
})

router.get('/update', sessionAuth, async (req: SongPlayRequest, res: Response) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // flush the headers to establish SSE with client

    SSEManager.addListener(req.query.serverId, req.sessionDetails.userId, (message) => {
        console.log('publishing?');
        res.write(`\ndata: ${JSON.stringify(message)}\n\n`);
    })

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
