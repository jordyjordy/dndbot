import React from 'react';
import { Playlist } from '../../reducers/playlists/playlistReducer';
import { RootState } from '../../utils/store';
import { useDispatch, useSelector } from 'react-redux';
import { setSongNumber } from '../../reducers/playStatus/actions';
import { request } from '../../utils/network';
import { setPlaylists } from '../../reducers/playlists/actions';
import { IonIcon } from '@ionic/react';
import { close, play } from 'ionicons/icons';

interface SongCardProps {
    song: Playlist['queue'][number]
    index: number
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

const SongCard = ({ song, index }: SongCardProps): JSX.Element => {
    const { playStatus, activePlaylist, serverId } = useSelector(selector);
    const dispatch = useDispatch();

    const playSong = (index: number): void => {
        dispatch(setSongNumber(index));
        request('/music/playsong', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playlist: activePlaylist, song: index, serverId }),
        }).catch(err => {
            console.error(err);
        });
    };

    const removeSong = (playlist: number, song: number): void => {
        if (window.confirm('Are you sure you want to remove the song?')) {
            request(`/songs?serverId=${serverId}&songIndex=${song}&playlistIndex=${playlist}`, {
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
        <div className={`song-card ${playStatus.song === index && activePlaylist === (playStatus.playlist ?? 0) ? 'active' : ''}`} key={song._id}>
            <button className='dndbtn play-button' onClick={() => { playSong(index); }}>
                <IonIcon color='#fff' icon={play} />
            </button>
            {song.name}
            <button onClick={() => { removeSong(activePlaylist, index); }} className='dndbtn remove-button'>
                <IonIcon icon={close} />
            </button>
        </div>
    );
};

export default SongCard;
