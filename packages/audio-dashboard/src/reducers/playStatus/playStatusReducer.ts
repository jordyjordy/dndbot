import { Action } from '../../utils/store';

const initialState = {
    playing: false,
    song: 0,
    playlist: '',
    loop: false,
    shuffle: false,
};

export interface PlayStatus {
    playing: boolean
    song: number
    playlist: string
    loop: boolean
    shuffle: boolean
};

const playStatusReducer = (state = initialState, action: Action): PlayStatus => {
    switch (action.type) {
        case 'playStatus/set':
            return { ...state, ...action.value };
        case 'playStatus/setSong':
            return { ...state, song: action.value };
        case 'playStatus/setPlaylist':
            return { ...state, playlist: action.value };
        case 'playStatus/setPlayStatus':
            return { ...state, playing: action.value };
        case 'playStatus/setLoop':
            return { ...state, loop: action.value };
        case 'playStatus/setShuffle':
            console.log(action.value);
            return { ...state, shuffle: action.value };
        default:
            return state;
    }
};

export default playStatusReducer;
