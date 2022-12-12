import express, {Response} from 'express';
const router = express.Router()
import client, { getConnection }  from '../bot';
import sessionAuth, { ISessionAuthRequest } from '../config/sessionAuth.js';

interface JoinChannelRequest extends ISessionAuthRequest {
    body: {
        channelId: string,
        serverId: string,
    }
}


router.post('/joinchannel', sessionAuth, async (req: JoinChannelRequest, res: Response): Promise<void> => {
    const member = await (await client.guilds.fetch(req.body.serverId)).members.fetch(req.sessionDetails.userId);
    if (member.voice.channelId === req.body.channelId) {
        const { connectionManager } = await getConnection(req.body.serverId);
        await connectionManager.connectToChannel(req.body.channelId, req.body.serverId);
        await connectionManager.play();
    }
    res.sendStatus(200);
})

export default router;