import express, {Response} from 'express';
const router = express.Router();
import axios from 'axios';
import client from '../bot/index.js';
import DiscordAuth, { ISessionAuthRequest, ISessionDetails } from '@jordyjordy/discord-express-auth';
import { APIGuild } from 'discord-api-types';

const getUserGuilds = async (sessionDetails: ISessionDetails): Promise<APIGuild[]> => {
    const { data: guilds } = await axios({
        method: 'get',
        url: 'https://discord.com/api/users/@me/guilds',
        headers: {
            authorization: `${sessionDetails.token_type} ${sessionDetails.access_token}`,
        },
    }).catch((err) => {
        console.log(err);
        return { data: [] };
    });
    return guilds;
};

const getUserData = async (sessionDetails) => {
    const userData = await axios({
        method: 'get',
        url: 'https://discord.com/api/users/@me',
        headers: {
            authorization: `${sessionDetails.token_type} ${sessionDetails.access_token}`,
        },
    });
    return userData;
};

router.get('/', DiscordAuth.identify, async (req: ISessionAuthRequest, res: Response): Promise<void> => {
    const { sessionDetails } = req;
    console.log(sessionDetails);
    try {
        const userData = await getUserData(sessionDetails);
        res.status(200).json({ ...userData.data });
    } catch (err) {
        console.log(err);
        res.cookie('access_token', '', { maxAge: -500,  path: "/", httpOnly: false ,secure: true, sameSite: 'none' });
        res.sendStatus(401);
    }

});

router.get('/guilds', DiscordAuth.identify, async(req: ISessionAuthRequest, res: Response): Promise<void> => {
    const { sessionDetails } = req;
    const guilds = await getUserGuilds(sessionDetails);
    res.status(200).json({ guilds: guilds });
});

router.get('/voicechannel', DiscordAuth.identify, async(req: ISessionAuthRequest, res: Response): Promise<void> => {
    const { sessionDetails } = req;
    try{
        const guildIds = (await getUserGuilds(sessionDetails)).map(({ id }) => id);
        const filteredGuilds = client.guilds.cache.filter(({ id }) => guildIds.includes(id));
        for(let i = 0; i < filteredGuilds.size; i++) {
            const guildWithUser = filteredGuilds.at(i);
            const member = await guildWithUser?.members.fetch(sessionDetails.userId);
            if(member && member.voice.channel) {
                res.status(200).json({ serverId: guildWithUser?.id, channelId: member.voice.channelId, 'serverName': guildWithUser?.name, 'voiceChannelName': member.voice.channel.name });
                return;
            }
        }
        res.status(200).json({});
        return;
    } catch (err) {
        console.error(err);
    }
    res.status(200).json({});
});

export default router;