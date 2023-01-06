import { configureStore, Action as ReduxAction } from '@reduxjs/toolkit';
import serverInfoReducer from '../reducers/serverInfo/serverInfoReducer';
import playlistReducer from '../reducers/playlists/playlistReducer';
import playStatusReducer from '../reducers/playStatus/playStatusReducer';
import requestStatusReducer from '../reducers/requestStatus/requestStatusReducer';

const store = configureStore({
    reducer: {
        serverInfo: serverInfoReducer,
        playlists: playlistReducer,
        playStatus: playStatusReducer,
        requestStatus: requestStatusReducer,
    },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;

export interface Action extends ReduxAction {
    value?: any
};
