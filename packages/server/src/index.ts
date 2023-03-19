import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

import client from './bot/index';

const app = express();
dotenv.config();
const originWhitelist = process.env.CORS_ORIGINS?.split(',');

import items from './routes/item';
import playlists from './routes/playlist';
import user from './routes/user';
import bot from './routes/bot';
import music from './routes/music';
import song from './routes/song';
import { sessionDetails } from './util/session';
import axios from 'axios';

mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);
mongoose.set("useFindAndModify", false);

mongoose.connect(process.env.DATABASE_URL as string).then(() => {
    console.log("Connected to database!");
});
const port = process.env.PORT || 5000;
app.use(cors({
    credentials: true,
    origin: function (ori, callback) {
        if (!ori || originWhitelist?.indexOf(ori ?? '') !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/item', items);
app.use('/playlists', playlists);
app.use('/user', user);
app.use('/bot', bot);
app.use('/music', music);
app.use('/songs', song);

app.get('/login', (req: Request, res: Response) => {
    req.query.redirect; 
    const loginUrl = `${process.env.LOGIN_URL}&redirect_uri=${
        encodeURIComponent(`${req.query.redirect}`)}`;
    res.redirect(loginUrl);
});

app.get('/getaccess', async ({ query }, res: Response) => {
    const {code, redirect_uri } = query;
    if (code) {
        try {
            const urlSearchParams = {
                client_id: process.env.CLIENT_ID as string,
                client_secret: process.env.CLIENT_SECRET as string,
                code: code.toString(),
                grant_type: 'authorization_code',
                redirect_uri: redirect_uri as string,
                scope: 'identify',
            };

            const tokenResponseData = await axios({
                method: 'post',
                url: 'https://discord.com/api/oauth2/token',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                data: new URLSearchParams(urlSearchParams),
            });

            if(tokenResponseData.status === 401) {
                throw new Error('Could not authorize with discord');
            }

            const data: sessionDetails = tokenResponseData.data;
            const userData = await axios({
                method: 'get',
                url: 'https://discord.com/api/users/@me',
                headers: {
                    authorization: `${data.token_type} ${data.access_token}`,
                },
            });
            const token = jwt.sign({ ...data, userId: userData.data.id, username: userData.data.username }, process.env.TOKEN_SECRET, {expiresIn: '30d'});
            res.cookie('access_token', token, { maxAge: 86400000 * 93,  path: "/", httpOnly: false ,secure: true, sameSite: 'none' });
            res.sendStatus(204);
            return;
        } catch (error) {
            // NOTE: An unauthorized token will not throw an error
            // tokenResponseData.statusCode will be 401
            console.error('could not authenticate');
            console.log(error.response.data);
            res.sendStatus(400);
        }
    }
});

app.listen(port, () => console.log("Listening on port " + port));

client.login(process.env.BOT_TOKEN);
