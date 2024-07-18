import express, { Response } from 'express';
const router = express.Router();
import busboy from 'busboy';
import userPlaylists from './userPlaylists';
import sessionAuth, { ISessionAuthRequest } from '../../config/sessionAuth';
import { getConnection } from '../../bot';
import ConnectionInterface from '../../util/ConnectionInterface';
import SSEManager from '../../util/SSeManager';
import { PassThrough } from 'stream';

router.use('/playlists', userPlaylists);

type SongPlayRequest = ISessionAuthRequest & {
    query: {
        serverId: string,
    }
    body: {
    }
};

type UpdateRequest = ISessionAuthRequest & {
    query: {
        serverId: string,
    }
};

type MusicAction = 'STOP' | 'PLAY' | 'PAUSE';

type MusicActionRequest = ISessionAuthRequest & {
    body: {
        action: MusicAction,
        serverId: string,
    }
};

router.post('/playsong', sessionAuth, async (req: SongPlayRequest, res: Response): Promise<void> => {
    const bb = busboy({ headers: req.headers });
    await getConnection(req.query.serverId);
    const connectionInterface = new ConnectionInterface(req.query.serverId);
    const connectionManager = await connectionInterface.getConnectionManager();
    if(!connectionManager.isConnected()) {
        await connectionInterface.joinVoiceChannel(req.sessionDetails.userId);
    }

    bb.on('file', (fieldname, file, filename, encoding, mimetype) => {

        const passthrough = new PassThrough();

        file.on('data', (data) => {
            passthrough.write(data);
        });

        passthrough.on('close', () => {
            file.destroy();
            req.destroy();
        });

        connectionManager.startSong(passthrough);
    });

    bb.on('finish', () => {
        res.sendStatus(200);
        console.log(process.memoryUsage());
    });

    req.pipe(bb);
});

router.post('/action', sessionAuth, async (req: MusicActionRequest, res: Response): Promise<void> => {
    const connection = await getConnection(req.body.serverId);

    switch (req.body.action as MusicAction) {
        case 'STOP':
            connection.connectionManager.clearConnection();
            break;
        case 'PLAY':
            await connection.connectionManager.play();
            break;
        case 'PAUSE':
            connection.connectionManager.pause();
            break;
        default:
            // do nothing;
            break;
    }
    res.sendStatus(200);
});

router.get('/update', sessionAuth, async (req: UpdateRequest, res: Response) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // flush the headers to establish SSE with client

    SSEManager.addListener(req.query.serverId, req.sessionDetails.userId, (message) => {
        res.write(`\ndata: ${JSON.stringify(message)}\n\n`);
    });

    // If client closes connection, stop sending events
    res.on('close', () => {
        SSEManager.removeListener(req.query.serverId, req.sessionDetails.userId);
        res.end();
    });
});

export default router;
