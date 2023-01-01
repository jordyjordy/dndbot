import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { request } from '../utils/network'
import { close, play, playOutline } from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import { setPlaylists } from '../reducers/playlists/actions';
import './Playlists.scss';
import { setPlayStatus, setPlaylistNumber, setSongNumber } from '../reducers/playStatus/actions';

export default function Playlists() {
    const { serverId, playlists, playStatus = {} } = useSelector((state) => { return { serverId: state?.serverInfo?.serverId, playlists: state.playlists, playStatus: state?.playStatus } });
    const dispatch = useDispatch();
    const [activePlaylist, setActivePlaylist] = useState(0);
    useEffect(() => {
        if(serverId) {
            request(`/playlists/list?server=${serverId}`)
                .then(res => res.json())
                .then(res => {
                    dispatch(setPlaylists(res));
                });
            request(`/music/status?serverId=${serverId}`).then(res => res.json())
                .then(res => {
                    dispatch(setPlayStatus(res));
                })
        }
        dispatch(setPlaylistNumber(0))
    }, [serverId, dispatch])

    const playSong = (index) => {
        dispatch(setSongNumber(index))
        setActivePlaylist(playStatus.playlist);
        request(`/music/playsong?playlistId=${playStatus.playlist}&songId=${index}&serverId=${serverId}`);
    }

    return (
        <div className='music-box'>
            <div className='playlists'>
                <h2>Playlists</h2>
                <div className='playlist-container'>
                    {playlists.map((playlist, index) => {
                        return (
                            <button
                                className={`playlist-card ${index === playStatus.playlist ? 'active' : ''}`}
                                key={playlist._id}
                                onClick={() => dispatch(setPlaylistNumber(index))}
                            >
                                {playlist.name}
                                {activePlaylist === index && (
                                    <div className='play-indicator'>
                                        <IonIcon icon={playOutline} />
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>
            <div className='songs'>
                <h2>
                    Songs
                </h2>
                <div className='song-container'>
                    {playlists[playStatus.playlist ?? 0]?.queue?.map((song, index) => {
                        return (
                            <div className={`song-card ${playStatus.song === index && activePlaylist === playStatus.playlist ? 'active' : ''}`} key={song._id}>
                                <button className='btn play-button' onClick={() => playSong(index)}>
                                    <IonIcon color='#fff' icon={play} />
                                </button>
                                {song.name}
                                <button className='btn remove-button'>
                                    <IonIcon icon={close} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}
