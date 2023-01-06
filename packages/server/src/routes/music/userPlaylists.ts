import express, { Response } from 'express';
const router = express.Router();
import sessionAuth, { ISessionAuthRequest } from '../../config/sessionAuth';
import UserPlayList from '../../model/userPlaylist';

interface GetPlaylistRequest extends ISessionAuthRequest {
    query: {
        playlistId: string,
    }
}

interface CreatePlaylistRequest extends ISessionAuthRequest {
    body: {
        name: string,
    }
}

router.get('/list', sessionAuth, async (req: ISessionAuthRequest, res: Response):Promise<void> => {
    const playlists = await UserPlayList.findByUserId(req.sessionDetails.userId);
    res.status(200).json(playlists);
});

router.get('/', sessionAuth, async (req: GetPlaylistRequest, res: Response):Promise<void> => {
    const playlist = await UserPlayList.findById(req.query.playlistId);
    res.status(200).json(playlist);
});

router.post('/', sessionAuth, async (req: CreatePlaylistRequest, res: Response):Promise<void> => {
    const playlist = await UserPlayList.createNewPlayList(req.body.name, req.sessionDetails.userId);
    res.status(201).json(playlist);
});

export default router;
