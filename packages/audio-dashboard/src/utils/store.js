import { configureStore } from '@reduxjs/toolkit'
import serverInfoReducer from '../reducers/serverInfo/serverInfoReducer'
import playlistReducer from '../reducers/playlists/playlistReducer';
import playStatusReducer from '../reducers/playStatus/playStatusReducer';

export default configureStore({
  reducer: {
    serverInfo: serverInfoReducer,
    playlists: playlistReducer,
    playStatus: playStatusReducer
  }
});
