import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

const app = express()
dotenv.config()

import client from './util/client.js';
import items from './routes/item.js';
import tokens from './routes/token.js';
import sessions from './routes/session.js';
import playlists from './routes/playlist.js'
import user from './routes/user.js';

mongoose.set('useCreateIndex', true)
mongoose.set('useUnifiedTopology', true)
mongoose.set('useNewUrlParser', true)
mongoose.set("useFindAndModify", false)
mongoose.connect(process.env.DATABASE_URL).then(() => {
    console.log("Connected to database!")
})
const port = process.env.PORT || 5000
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/item', items)
app.use('/token', tokens)
app.use("/sessions", sessions)
app.use('/playlists', playlists)
app.use('/user', user)
app.listen(port, () => console.log("Listening on port " + port))
