import { Action } from '../../utils/store';

const initialState: Playlist[] = [];

const playlistReducer = (state = initialState, action: Action): Playlist[] => {
    switch (action.type) {
        case 'playlists/set':
            return [...action.value];
        default:
            return state;
    }
};

export interface Playlist {
    _id: string
    name: string
    server: string
    queue: Array<{ name: string, url: string, _id: string }>
};

export default playlistReducer;
