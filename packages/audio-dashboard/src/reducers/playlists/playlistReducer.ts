import { Action } from '../../utils/store';

const initialState: PlaylistReducerState = {
    playlists: [],
    activePlaylist: '',
};

const playlistReducer = (state = initialState, action: Action): PlaylistReducerState => {
    switch (action.type) {
        case 'playlists/set':
            return {
                ...state,
                playlists: [...action.value as Playlist[]],
            };
        case 'playlists/setActive':
            return {
                ...state,
                activePlaylist: action.value as string,
            };
        default:
            return state;
    }
};

interface PlaylistReducerState {
    playlists: Playlist[]
    activePlaylist: string
}

export interface Playlist {
    _id: string
    name: string
    server: string
    queue: Array<{ name: string, url: string, _id: string }>
};

export default playlistReducer;
