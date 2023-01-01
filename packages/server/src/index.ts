import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import client from './bot/index';
import cookieParser from 'cookie-parser';

const app = express()
dotenv.config()

import items from './routes/item';
import tokens from './routes/token';
import sessions from './routes/session';
import playlists from './routes/playlist'
import user from './routes/user';
import bot from './routes/bot';
import music from './routes/music';

mongoose.set('useCreateIndex', true)
mongoose.set('useUnifiedTopology', true)
mongoose.set('useNewUrlParser', true)
mongoose.set("useFindAndModify", false)

mongoose.connect(process.env.DATABASE_URL as string).then(() => {
    console.log("Connected to database!")
})
const port = process.env.PORT || 5000
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser());
app.use('/item', items)
app.use('/token', tokens)
app.use("/sessions", sessions)
app.use('/playlists', playlists)
app.use('/user', user)
app.use('/bot', bot)
app.use('/music', music)
app.listen(port, () => console.log("Listening on port " + port))

client.login(process.env.BOT_TOKEN)
