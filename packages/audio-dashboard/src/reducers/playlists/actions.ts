import { Action } from '../../utils/store';
import { Playlist } from './playlistReducer';

export const setPlaylists = (value: Playlist[]): Action => {
    return {
        type: 'playlists/set',
        value,
    };
};
