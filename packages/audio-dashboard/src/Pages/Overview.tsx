import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { request } from '../utils/network';
import { setServerInfo } from '../reducers/serverInfo/actions';
import './Overview.scss';
import Player from '../Components/Player';
import { useNavigate } from 'react-router';
import PlayStateManager from '../Components/PlayStateManager';
import store, { RootState } from '../utils/store';
import PlaylistList from '../Components/Playlists/PlaylistList';
import SongList from '../Components/Songs/SongList';
import { IonIcon } from '@ionic/react';
import { syncOutline } from 'ionicons/icons';
import ConnectionIndicator from '../Components/Connection/ConnectionIndicator';
import { setActivePlaylist } from '../reducers/playlists/actions';
import { setPlaylistNumber, setSong, setSongEnded } from '../reducers/playStatus/actions';

interface DiscordUser {
    username: string
    avatar: string
    id: string
}

export default function Overview (): JSX.Element | null {
    const [user, setUser] = useState<DiscordUser>();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [playLists, setPlaylists] = useState<RootState['playlists']['playlists']>([]);
    const { serverInfo, serverId, currentSong, currentPlaylist, playStatus } = useSelector((state: RootState) => ({
        serverInfo: state.serverInfo,
        activePlaylist: state.playlists.activePlaylist,
        serverId: state.serverInfo.serverId,
        currentSong: state.playStatus.song,
        currentPlaylist: state.playStatus.playlist,
        playStatus: state.playStatus,
    }), shallowEqual);

    const playlist = useMemo(() => {
        return playLists.find((pl) => pl._id === currentPlaylist);
    }, [currentPlaylist, playLists]);

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
            dispatch(setServerInfo(json));
        }).catch(err => {
            console.error(err);
        });
    }, [dispatch]);

    useEffect(() => {
        getCurrentVoiceChannel();
    }, [getCurrentVoiceChannel]);

    const playSong = (index = currentSong, usedPlaylist = currentPlaylist): void => {
        let playlist = playLists.find(({ _id }) => _id === usedPlaylist);
        playlist = playlist ?? playLists[0];
        const song = playlist?.queue[index];
        dispatch(setSong(index));
        dispatch(setPlaylistNumber(playlist._id));
        // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
        // @ts-ignore
        song.data.getFile().then((file) => {
            const formData = new FormData();
            formData.append('file', file);
            request(`/music/playsong?serverId=${serverId as string}`, {
                method: 'POST',
                body: formData,
            }).catch(err => {
                console.error(err);
            });
        });
    };

    const repeat = (): void => {
        const playState = store.getState().playStatus;

        if (playState.loop) {
            playSong(currentSong);
            return;
        }
        let index = (currentSong + 1) % (playlist?.queue.length ?? 1);
        if (playState.shuffle) {
            index = Math.random() * (((playlist?.queue.length ?? 0) - 1) ?? 1);
            if (index >= currentSong) {
                index += 1;
            }
            index %= (playlist?.queue.length ?? 1);
        }
        playSong(Math.floor(index));
    };

    useEffect(() => {
        if (playStatus.songEnded) {
            dispatch(setSongEnded(false));
            repeat();
        }
    }, [playStatus.songEnded]);

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
                            {/* eslint-disable react/no-unknown-property */}
                            {/* eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error */}
                            {/* @ts-ignore */}
                            {serverInfo.serverName !== undefined && (
                                <button type="button" onClick={() => {
                                    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
                                    // @ts-ignore
                                    window.showDirectoryPicker().then(async (res) => {
                                        const newPlaylists = [];
                                        const basePlaylist = {
                                            _id: res.name,
                                            name: res.name,
                                            queue: [] as any[],
                                        };
                                        for await (const value of res.values()) {
                                            // console.log(value);
                                            if (value.kind === 'directory') {
                                                const playlist = {
                                                    _id: value.name,
                                                    name: value.name,
                                                    queue: [] as any[],
                                                };
                                                for await (const innerValue of value.values()) {
                                                    if (innerValue.kind === 'file') {
                                                        // console.log(innerValue);
                                                        const innerFile = await innerValue.getFile();
                                                        console.log(innerFile);
                                                        if (innerFile.type === 'audio/mpeg') {
                                                            playlist.queue.push({
                                                                _id: innerValue.name,
                                                                name: innerValue.name,
                                                                data: innerValue,
                                                            });
                                                        }
                                                    }
                                                }
                                                newPlaylists.push(playlist);
                                            } else {
                                                const innerFile = await value.getFile();
                                                if (innerFile.type === 'audio/mpeg') {
                                                    basePlaylist.queue.push({
                                                        _id: value.name,
                                                        name: value.name,
                                                        data: value,
                                                    });
                                                }
                                            }
                                        }
                                        if (basePlaylist.queue.length > 0 || newPlaylists.length === 0) {
                                            newPlaylists.unshift(basePlaylist);
                                        }
                                        setPlaylists(newPlaylists);
                                        dispatch(setActivePlaylist(newPlaylists[0]._id));
                                        dispatch(setPlaylistNumber(newPlaylists[0]._id));
                                    });
                                }} id="folder-select">
                                    Select folder
                                </button>
                            )}
                        </div>
                        <div>
                            {user.username}
                            <img className='user-avatar ms-3' src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`} />
                        </div>

                    </div>
                    <div className='music-box'>
                        <PlaylistList playlists={playLists} />
                        <SongList playlists={playLists} playSong={playSong} />
                    </div>
                    <Player
                        playlists={playLists}
                        playSong={playSong}
                    />
                </div>
            </PlayStateManager>
        )
        : null;
}
