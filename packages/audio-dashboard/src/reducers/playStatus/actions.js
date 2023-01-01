export const setPlayStatus = (value) => {
    return {
        type: 'playStatus/set',
        value
    };
};

export const setSongNumber = value => {
    return {
        type: 'playStatus/setSong',
        value
    }
}

export const setPlaylistNumber = value => {
    return {
        type: 'playStatus/setPlaylist',
        value
    }
}

export const setPlaying = value => {
    return {
        type: 'playStatus/setPlayStatus',
        value
    }
}

export const setLoop = value => {
    return {
        type: 'playStatus/setLoop',
        value
    }
}

export const setShuffle = value => {
    return {
        type: 'playStatus/setShuffle',
        value
    }
}