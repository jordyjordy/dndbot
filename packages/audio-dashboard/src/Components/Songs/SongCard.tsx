import React, { MouseEventHandler } from 'react';
import { Playlist } from '../../reducers/playlists/playlistReducer';
import { RootState } from '../../utils/store';
import { useDispatch, useSelector } from 'react-redux';
import { setSongId } from '../../reducers/playStatus/actions';
import { request } from '../../utils/network';
import { setPlaylists } from '../../reducers/playlists/actions';
import { IonIcon } from '@ionic/react';
import { close, play, reorderFourOutline } from 'ionicons/icons';
import RenameSongButton from './RenameSongButton';

interface SongCardProps {
    item: Playlist['queue'][number]
    index: number
    dragHandleProps: { onMouseDown: MouseEventHandler<HTMLDivElement> }
}

const selector = (state: RootState): {
    playStatus: RootState['playStatus']
    activePlaylist: RootState['playlists']['activePlaylist']
    serverId: RootState['serverInfo']['serverId']
} => ({
    playStatus: state.playStatus,
    activePlaylist: state.playlists.activePlaylist,
    serverId: state.serverInfo.serverId,
});

const SongCard = ({ item: song, index, dragHandleProps }: SongCardProps): JSX.Element => {
    const { playStatus, activePlaylist, serverId } = useSelector(selector);
    const dispatch = useDispatch();

    const playSong = (id: string): void => {
        dispatch(setSongId(id));
        request('/music/playsong', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playlist: activePlaylist, song: id, serverId }),
        }).catch(err => {
            console.error(err);
        });
    };

    const removeSong = (playlist: string, song: number): void => {
        if (window.confirm('Are you sure you want to remove the song?') && serverId !== undefined) {
            request(`/songs?serverId=${serverId}&songIndex=${song}&playlistId=${playlist}`, {
                method: 'DELETE',
            })
                .then(async (res) => {
                    const data = await res.json();
                    dispatch(setPlaylists(data.playlists));
                })
                .catch(err => {
                    console.error(err);
                });
        }
    };

    return (
        <div className={`song-card ${playStatus.song === song._id && activePlaylist === (playStatus.playlist ?? 0) ? 'active' : ''}`} key={song._id}>
            <div className='left-block'>
                <div className='draggable' onMouseDown={dragHandleProps.onMouseDown}>
                    <IonIcon color="white" icon={reorderFourOutline} />
                </div>
                <div onClick={() => { playSong(song._id); }} className='play-button'>
                    <IonIcon icon={play} />
                </div>
                <div className='card-name'>
                    {song.name}
                    <RenameSongButton song={song} />
                </div>
            </div>
            <div onClick={() => { removeSong(activePlaylist, index); }} className='remove-button'>
                <IonIcon icon={close} />
            </div>
        </div>
    );
};

export default SongCard;
