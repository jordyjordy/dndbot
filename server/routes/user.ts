import express, {Response} from 'express';
const router = express.Router()
import axios from 'axios';
import sessionAuth, { ISessionAuthRequest } from '../config/sessionAuth.js';


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
    const { data: guilds } = await axios({
        method: 'get',
        url: 'https://discord.com/api/users/@me/guilds',
        headers: {
            authorization: `${sessionDetails.token_type} ${sessionDetails.access_token}`
        }
    });

    // for(let i = 0; i < client.guilds.cache.size; i++) {
    //     const guild = client.guilds.cache.at(i);
    //     const members = await guild.members.fetch();
    //     const member = members.get(sessionDetails.userId);
    // }
    res.status(200).json({ guilds: guilds })
})

export default router;