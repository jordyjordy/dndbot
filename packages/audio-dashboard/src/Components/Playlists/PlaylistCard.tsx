import React from 'react';
import { Playlist } from '../../reducers/playlists/playlistReducer';
import { RootState } from '../../utils/store';
import { useDispatch, useSelector } from 'react-redux';
import { setActivePlaylist, setPlaylists } from '../../reducers/playlists/actions';
import { IonIcon } from '@ionic/react';
import { close, playOutline } from 'ionicons/icons';
import { request } from '../../utils/network';
import RenamePlaylistButton from './RenamePlaylistButton';

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
    const { activePlaylist, playStatus, playlists, serverId } = useSelector(selector);
    const dispatch = useDispatch();

    const removePlaylist = (index: number): void => {
        if (window.confirm('Are you sure you want to remove the playlist?')) {
            request(`/playlists?playlistId=${playlists[index]._id}&serverId=${serverId}`, {
                method: 'DELETE',
            }).then(async (res) => {
                const data = await res.json();
                dispatch(setPlaylists(data.playlists));
            }).catch(err => {
                console.log(err);
            });
        }
    };
    return (
        <div
            className={`playlist-card ${playlist._id === activePlaylist ? 'active' : ''}`}
            key={playlist._id}
            onClick={() => {
                dispatch(setActivePlaylist(playlist._id));
            }}
        >
            {(playStatus.playlist ?? '') === playlist._id && (
                <div className='play-indicator'>
                    <IonIcon icon={playOutline} />
                </div>
            )}
            <div className='card-name'>
                {playlist.name}
                <RenamePlaylistButton playlist={playlist} />
            </div>
            <button
                onClick={() => {
                    removePlaylist(index);
                }}
                className='dndbtn remove-button'
            >
                <IonIcon icon={close} />
            </button>
        </div>
    );
};

export default PlaylistCard;
