import express, {Response} from 'express';
const router = express.Router()
import axios from 'axios';
import sessionAuth, { ISessionAuthRequest } from '../config/sessionAuth.js';
import client from '../botClient/index.js';
import { sessionDetails } from '../util/sessionManager.js';
import { APIGuild } from 'discord-api-types';

const getUserGuilds = async (sessionDetails: sessionDetails): Promise<APIGuild[]> => {
    const { data: guilds } = await axios({
        method: 'get',
        url: 'https://discord.com/api/users/@me/guilds',
        headers: {
            authorization: `${sessionDetails.token_type} ${sessionDetails.access_token}`
        }
    });
    return guilds;
}

router.get('/', sessionAuth, async (req: ISessionAuthRequest, res: Response): Promise<void> => {
    const { sessionDetails } = req;
    const userData = await axios({
        method: 'get',
        url: 'https://discord.com/api/users/@me',
        headers: {
            authorization: `${sessionDetails.token_type} ${sessionDetails.access_token}`
        }
    });
    res.status(200).json({ ...userData.data })
})

router.get('/guilds', sessionAuth, async(req: ISessionAuthRequest, res: Response): Promise<void> => {
    const { sessionDetails } = req;
    const guilds = await getUserGuilds(sessionDetails);
    res.status(200).json({ guilds: guilds })
})

router.get('/voicechannel', sessionAuth, async(req: ISessionAuthRequest, res: Response): Promise<void> => {
    const { sessionDetails } = req;
    try{
        console.log(sessionDetails);
        const guildIds = (await getUserGuilds(sessionDetails)).map(({ id }) => id);
        const filteredGuilds = client.guilds.cache.filter(({ id }) => guildIds.includes(id))
        for(let i = 0; i < filteredGuilds.size; i++) {
            const guildWithUser = filteredGuilds.at(i);
            const member = await guildWithUser?.members.fetch(sessionDetails.userId);
            if(member && member.voice.channel) {
                res.status(200).json({ serverId: guildWithUser?.id, channelId: member.voice.channelId, 'serverName': guildWithUser?.name, 'voiceChannelName': member.voice.channel.name });
                return;
            }
        }
        return  res.status(200).json({});
    } catch (err) {
        console.error(err);
    }
    res.status(200).json({});
})

export default router;