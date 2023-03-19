import express, {Response} from 'express';
const router = express.Router();
import client  from '../bot';
import sessionAuth, { ISessionAuthRequest } from '../config/sessionAuth';

interface JoinChannelRequest extends ISessionAuthRequest {
    body: {
        channelId: string,
        serverId: string,
    }
}

router.post('/joinchannel', sessionAuth, async (req: JoinChannelRequest, res: Response): Promise<void> => {
    const member = await (await client.guilds.fetch(req.body.serverId)).members?.fetch(req.sessionDetails.userId);
    if (member && member.voice.channelId === req.body.channelId) {
        const { connectionManager } = await client.getConnection(req.body.serverId);
        await connectionManager.connectToChannel({ channelId: req.body.channelId });
    }
    res.sendStatus(200);
});


export default router;