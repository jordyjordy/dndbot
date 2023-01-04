import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { request } from '../utils/network'
import { close, play, playOutline } from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import { setPlaylists } from '../reducers/playlists/actions';
import './Playlists.scss';
import { setSongNumber } from '../reducers/playStatus/actions';
import CreatePlaylistModal from './CreatePlaylistModal';
import CreateSongModal from './CreateSongModal';

export default function Playlists() {
    const { serverId, playlists, playStatus } = useSelector((state) => { return { serverId: state?.serverInfo?.serverId, playlists: state.playlists, playStatus: state?.playStatus } });
    const dispatch = useDispatch();
    const [activePlaylist, setActivePlaylist] = useState(0);

    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [showSongModal, setShowSongModal] = useState(false);
    useEffect(() => {
        if(serverId) {
            request(`/playlists/list?server=${serverId}`)
                .then(res => res.json())
                .then(res => {
                    dispatch(setPlaylists(res));
                });
            request(`/music/status?serverId=${serverId}`).then(res => res.json())
        }
    }, [serverId, dispatch])

    const playSong = (index) => {
        dispatch(setSongNumber(index))
        request('/music/playsong', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ playlist: activePlaylist, song: index, serverId }),
        });
    }

    const removeSong = (playlist, song) => {
        if(window.confirm("Are you sure you want to remove the song?")) {
            request(`/songs?serverId=${serverId}&songIndex=${song}&playlistIndex=${playlist}`, {
                method: 'DELETE'
            })
            .then(async (res) => {
                const data = await res.json();
                dispatch(setPlaylists(data.playlists))
            })
        }
    }

    const removePlaylist = (index) => {
        if (window.confirm("Are you sure you want to remove the playlist?")) {
            request(`/playlists?playlistId=${playlists[index]._id}&serverId=${serverId}`, {
                method: 'DELETE',
            }).then(async (res) => {
                const data = await res.json();
                dispatch(setPlaylists(data.playlists))
            })
        }
    }

    return (
        <div className='music-box'>
            <div className='playlists'>
                <h2>Playlists</h2>
                <div className='playlist-container'>
                    {playlists.map((playlist, index) => {
                        return (
                            <div
                                className={`playlist-card ${index === activePlaylist ? 'active' : ''}`}
                                key={playlist._id}
                                onClick={() => setActivePlaylist(index)}
                            >
                                {(playStatus.playlist ?? 0) === index && (
                                    <div className='play-indicator'>
                                        <IonIcon icon={playOutline} />
                                    </div>
                                )}
                                {playlist.name}
                                <button onClick={() =>removePlaylist(index)} className='dndbtn remove-button'>
                                    <IonIcon icon={close} />
                                </button>
                            </div>
                        )
                    })}
                    {serverId && (
                        <>
                            <button className='dndbtn' onClick={() => setShowPlaylistModal(true)}>Add playlist</button>
                            <CreatePlaylistModal isOpen={showPlaylistModal} close={() => setShowPlaylistModal(false)} />
                        </>
                    )}
                </div>
            </div>
            <div className='songs'>
                <h2>
                    Songs
                </h2>
                <div className='song-container'>
                    {playlists[activePlaylist]?.queue?.map((song, index) => {
                        return (
                            <div className={`song-card ${playStatus.song === index && activePlaylist === (playStatus.playlist ?? 0) ? 'active' : ''}`} key={song._id}>
                                <button className='dndbtn play-button' onClick={() => playSong(index)}>
                                    <IonIcon color='#fff' icon={play} />
                                </button>
                                {song.name}
                                <button onClick={() => removeSong(activePlaylist, index)} className='dndbtn remove-button'>
                                    <IonIcon icon={close} />
                                </button>
                            </div>
                        );
                    })}
                    {serverId && (
                        <>
                            <button onClick={() => setShowSongModal(true)} className='dndbtn'>Add song</button>
                            <CreateSongModal isOpen={showSongModal} close={() => setShowSongModal(false)} currentPlaylist={activePlaylist} />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
