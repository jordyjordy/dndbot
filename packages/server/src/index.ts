import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import DiscordAuth from '@thepineappledev/discord-express-auth';
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

DiscordAuth.configure({
    clientId: process.env.CLIENT_ID as string,
    clientSecret: process.env.CLIENT_SECRET as string,
    tokenSecret: process.env.TOKEN_SECRET as string,
    scope: 'identify guilds',
});

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

app.get('/authorize', DiscordAuth.authorize);

app.get('/login', DiscordAuth.authCodeToJwtToken);

app.get('/logout', DiscordAuth.logout);

app.listen(port, () => console.log("Listening on port " + port));

client.login(process.env.BOT_TOKEN);
