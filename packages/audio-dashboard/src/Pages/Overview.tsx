import React, { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { request } from '../utils/network';
import { setServerInfo } from '../reducers/serverInfo/actions';
import './Overview.scss';
import Player from '../Components/Player';
import { useNavigate } from 'react-router';
import PlayStateManager from '../Components/PlayStateManager';
import { RootState } from '../utils/store';
import { setActivePlaylist, setPlaylists } from '../reducers/playlists/actions';
import PlaylistList from '../Components/Playlists/PlaylistList';
import SongList from '../Components/Songs/SongList';

export default function User (): JSX.Element | null {
    const [user, setUser] = useState<string>();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { serverInfo, activePlaylist } = useSelector((state: RootState) => ({
        serverInfo: state.serverInfo,
        activePlaylist: state.playlists.activePlaylist,
    }));
    useEffect(() => {
        request('/user').then(async res => {
            if (res.status === 401) {
                navigate('/');
                return;
            }
            const { username } = await res.json();
            setUser(username);
        }).catch(() => {
            navigate('/');
        });
    }, [navigate]);

    const getCurrentVoiceChannel = useCallback(() => {
        request('/user/voicechannel').then(async res => {
            const json = await res.json();
            dispatch(setServerInfo(json));
        }).catch(err => {
            console.error(err);
        });
    }, [dispatch]);

    useEffect(() => {
        getCurrentVoiceChannel();
    }, [getCurrentVoiceChannel]);

    useEffect(() => {
        if (serverInfo.serverId !== undefined) {
            request(`/playlists/list?server=${serverInfo.serverId}`)
                .then(async (res) => {
                    const data = await res.json();
                    dispatch(setPlaylists(data ?? []));
                    if (activePlaylist === '') {
                        dispatch(setActivePlaylist(data[0]._id));
                    }
                }).catch(err => {
                    console.error(err);
                });
        }
    }, [serverInfo.serverId, dispatch]);

    return user !== undefined
        ? (
            <PlayStateManager>
                <div className="overview">
                    <div className="overview-topbar">
                        <div>
                            {`User: ${user}`}
                        </div>
                        {serverInfo?.serverName !== '' && serverInfo?.serverName !== undefined
                            ? (
                                <div className="server-details">
                                    <span>{`Server Name: ${serverInfo?.serverName}`}</span>
                                    <span>{`Voice Channel: ${serverInfo?.voiceChannelName}`}</span>
                                </div>
                            )
                            : (
                                <div>
                                User not currently connected to a voice channel
                                </div>
                            )}
                        <div>
                            <button className="dndbtn" onClick={getCurrentVoiceChannel}>
                            Refresh voice channel
                            </button>
                        </div>
                    </div>
                    <div className='music-box'>
                        <PlaylistList />
                        <SongList />
                    </div>
                    <Player />
                </div>
            </PlayStateManager>
        )
        : null;
}
