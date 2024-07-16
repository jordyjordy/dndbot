import React from 'react';
import { Playlist } from '../../reducers/playlists/playlistReducer';
import { RootState } from '../../utils/store';
import { useDispatch, useSelector } from 'react-redux';
import { setActivePlaylist } from '../../reducers/playlists/actions';
import { IonIcon } from '@ionic/react';
import { playOutline } from 'ionicons/icons';

interface PlaylistCardProps {
    item: Playlist
    index: number
}

const selector = (state: RootState): {
    activePlaylist: RootState['playlists']['activePlaylist']
    playStatus: RootState['playStatus']
    playlists: RootState['playlists']['playlists']
    serverId: RootState['serverInfo']['serverId']
} => ({
    activePlaylist: state.playlists.activePlaylist,
    playStatus: state.playStatus,
    playlists: state.playlists.playlists,
    serverId: state.serverInfo.serverId,
});

const PlaylistCard = ({ item: playlist, index }: PlaylistCardProps): JSX.Element => {
    const { activePlaylist, playStatus } = useSelector(selector);
    const dispatch = useDispatch();

    return (
        <div
            className={`playlist-card ${playlist._id === activePlaylist ? 'active' : ''}`}
            key={playlist._id}
            onClick={() => {
                dispatch(setActivePlaylist(playlist._id));
            }}
        >
            {(playStatus.playlist ?? '') === playlist._id && (
                <div className={`play-indicator ${(playStatus.playlist ?? '') === playlist._id ? 'active' : ''}`}>
                    <IonIcon icon={playOutline} />
                </div>
            )}
            <div className='card-name'>
                {playlist.name}
            </div>
        </div>
    );
};

export default PlaylistCard;
