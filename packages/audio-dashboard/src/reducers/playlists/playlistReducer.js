const initialState = [];

export default function playlistReducer(state = initialState, action) {
    switch(action.type) {
        case 'playlists/set':
            return [...action.value ];
        default:
            return state;
    }
}