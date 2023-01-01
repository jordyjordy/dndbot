import express, {Request, Response} from 'express';
import { URLSearchParams } from 'url';
const router = express.Router()
import Token from '../model/token.js';
import axios from 'axios';
import sessionManager, { sessionDetails } from '../util/sessionManager.js';
import jwt from 'jsonwebtoken';

router.get('/', async (req: Request, res: Response) => {
    const result = await Token.generateToken(req.query.user as string,req.query.server as string)
    res.status(200).json({ result })
})

router.get('/discord', async ({query}, res: Response) => {
    const {code} = query;
    if (code) {
        console.log('yes');
		try {
            const urlSearchParams = {
                client_id: process.env.CLIENT_ID as string,
                client_secret: process.env.CLIENT_SECRET as string,
                code: code.toString(),
                grant_type: 'authorization_code',
                redirect_uri: 'http://localhost:3000/redirect',
                scope: 'identify',
                }

            const tokenResponseData = await axios({
                method: 'post',
                url: 'https://discord.com/api/oauth2/token',
                headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                },
                data: new URLSearchParams(urlSearchParams)
            });

            const data: sessionDetails = tokenResponseData.data;

            const userData = await axios({
                method: 'get',
                url: 'https://discord.com/api/users/@me',
                headers: {
                    authorization: `${data.token_type} ${data.access_token}`
                }
            });
            const token = jwt.sign({ ...data, userId: userData.data.id, username: userData.data.username }, process.env.TOKEN_SECRET, {expiresIn: '30d'})
            res.cookie('access_token', token, { httpOnly: false, secure: false, });
            console.log('interesting');
            res.status(200).send('Succesfully authenticated');
            return;
		} catch (error) {
            console.log('no');
			// NOTE: An unauthorized token will not throw an error
			// tokenResponseData.statusCode will be 401
			console.error(error);
		}
	}
    res.status(200).send('aaaaaaaaaaaa');
})

router.get('/validate', async (req: Request, res: Response) => {
    try {
        const token = await Token.findOne({ token: req.query.token })
        if (token == null) {
            res.status(200).json(false)
        } else {
            res.status(200).json(true)
        }
    } catch (err) {
        res.status(200).json(false)
    }
})

router.delete('/clear', async (req: Request, res: Response) => {
    try {
        await Token.deleteOne({ token: req.query.token })
        res.status(200).send()
    } catch (err) {
        res.status(400).send()
    }
})

export default router;