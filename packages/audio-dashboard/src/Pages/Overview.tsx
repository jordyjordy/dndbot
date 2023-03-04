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
import { IonIcon } from '@ionic/react';
import { syncOutline } from 'ionicons/icons';
import ConnectionIndicator from '../Components/Connection/ConnectionIndicator';

interface DiscordUser {
    username: string
    avatar: string
    id: string
}

export default function User (): JSX.Element | null {
    const [user, setUser] = useState<DiscordUser>();
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
            const user = await res.json();
            setUser(user);
        }).catch(() => {
            navigate('/');
        });
    }, [navigate]);

    const getCurrentVoiceChannel = useCallback(() => {
        request('/user/voicechannel').then(async res => {
            const json = await res.json();
            console.log(json);
            dispatch(setServerInfo(json));
        }).catch(err => {
            console.error(err);
        });
    }, [dispatch]);

    useEffect(() => {
        getCurrentVoiceChannel();
    }, [getCurrentVoiceChannel]);

    useEffect(() => {
        if (serverInfo.serverId !== '' && serverInfo.serverId !== undefined) {
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
                        <img className='navbar-logo' src="/android-chrome-512x512.png" />
                        <div className='d-flex navbar-connect'>
                            <button className="dndbtn" onClick={getCurrentVoiceChannel}>
                                <IonIcon icon={syncOutline} />
                                Auto Connect
                            </button>
                            <ConnectionIndicator isConnected={serverInfo.serverName !== undefined} />
                            <span className='dndbtn'>{`${serverInfo?.serverName ?? 'Not connected'}`}</span>
                            <span className='dndbtn'>{`${serverInfo?.voiceChannelName ?? 'Not connected'}`}</span>
                        </div>
                        <div>
                            {user.username}
                            <img className='user-avatar ms-3' src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`} />
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
