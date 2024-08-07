import express, { Response } from 'express';
const router = express.Router();
import { Formidable } from 'formidable';
import userPlaylists from './userPlaylists';
import sessionAuth, { ISessionAuthRequest } from '../../config/sessionAuth';
import { getConnection } from '../../bot';
import ConnectionInterface from '../../util/ConnectionInterface';
import SSEManager from '../../util/SSeManager';
import { PassThrough } from 'stream';
import { createReadStream } from 'fs';

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
    await getConnection(req.query.serverId);
    const connectionInterface = new ConnectionInterface(req.query.serverId);
    const connectionManager = await connectionInterface.getConnectionManager();
    if(!connectionManager.isConnected()) {
        await connectionInterface.joinVoiceChannel(req.sessionDetails.userId);
    }

    const form = new Formidable();

    form.on('file', (name, file) => {
        const stream = createReadStream(file.filepath);

        stream.on('close', () => {
            file.destroy();
            req.destroy();
        });
        connectionManager.startSong(stream);
    });

    form.parse(req, () => {
        console.log(process.memoryUsage());
        console.log('done?');
        req.destroy();
        res.sendStatus(200);
    });
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
