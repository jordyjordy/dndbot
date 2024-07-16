import { Action } from '../../utils/store';
import { PlayStatus } from './playStatusReducer';

export const setPlayStatus = (value: PlayStatus): Action => {
    return {
        type: 'playStatus/set',
        value,
    };
};

export const setSong = (value: PlayStatus['song']): Action => {
    return {
        type: 'playStatus/setSong',
        value,
    };
};

export const setPlaylistNumber = (value: PlayStatus['playlist']): Action => {
    return {
        type: 'playStatus/setPlaylist',
        value,
    };
};

export const setPlaying = (value: PlayStatus['playing']): Action => {
    return {
        type: 'playStatus/setPlayStatus',
        value,
    };
};

export const setLoop = (value: PlayStatus['loop']): Action => {
    return {
        type: 'playStatus/setLoop',
        value,
    };
};

export const setShuffle = (value: PlayStatus['shuffle']): Action => {
    console.log('every day im shuffling');
    return {
        type: 'playStatus/setShuffle',
        value,
    };
};
