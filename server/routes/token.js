import express from 'express';
const router = express.Router()
import Token from '../model/token.js';
import axios from 'axios';
import sessionManager from '../util/sessionManager.js';

async function getJSONResponse(body) {
	let fullBody = '';

	for await (const data of body) {
		fullBody += data.toString();
	}
	return JSON.parse(fullBody);
}

router.get('/', async (req, res) => {
    const result = await Token.generateToken(req.query.user,req.query.server)
    res.status(200).json({ result })
})

router.get('/discord', async ({query}, res) => {
    const {code} = query;

    if (code) {
		try {
            const tokenResponseData = await axios({
                method: 'post',
                url: 'https://discord.com/api/oauth2/token',
                headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                },
                data: new URLSearchParams({
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: 'http://localhost:3000/redirect',
                scope: 'identify',
                })
            });

            const {data} = tokenResponseData;

            const userData = await axios({
                method: 'get',
                url: 'https://discord.com/api/users/@me',
                headers: {
                    authorization: `${data.token_type} ${data.access_token}`
                }
            });
            const sessionId = sessionManager.storeSession({ ...data, userId: userData.data.id, username: userData.data.username })
            res.status(200).json({ sessionId });
            return;
		} catch (error) {
			// NOTE: An unauthorized token will not throw an error
			// tokenResponseData.statusCode will be 401
			console.error(error);
		}
	}
    res.status(200).send('aaaaaaaaaaaa');
})

router.get('/validate', async (req, res) => {
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

router.delete('/clear', async (req, res) => {
    try {
        await Token.deleteOne({ token: req.query.token })
        res.status(200).send()
    } catch (err) {
        res.status(400).send()
    }
})

export default router;