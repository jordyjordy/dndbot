import { useCallback, useEffect, useRef, useState } from "react"
import { useSelector, useDispatch } from 'react-redux'
import { request } from "../utils/network.js";
import Playlists from "../Components/Playlists.jsx";
import { setServerInfo } from "../reducers/serverInfo/actions.js";
import './Overview.scss';
import Player from "../Components/Player.jsx";
import { useNavigate } from "react-router";
import PlayStateManager from "../Components/PlayStateManager.jsx";

export default function User() {
    const isFetching = useRef(false);
    const [user, setUser] = useState();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const serverInfo = useSelector((state) => state.serverInfo);
    useEffect(() => {
        if(!isFetching.current) {
            isFetching.current = true;
            if(localStorage.getItem('sessionId')) {
                request('/user').then(async res => {
                    if(res.status === 401) {
                        navigate('/')
                        return;
                    }
                    const { username } = await res.json();
                    console.log(username);
                    setUser(username)
                }).catch(err => {
                    navigate('/');
                })
            }
        }
    }, [navigate])

    const getCurrentVoiceChannel = useCallback(() => {
        request('/user/voicechannel').then(async res => {
            const json = await res.json();
            dispatch(setServerInfo(json));
        })
    }, [dispatch]);
    

    useEffect(() => {
        getCurrentVoiceChannel();
    }, [getCurrentVoiceChannel]);

    return user ? (
        <PlayStateManager>
            <div className="overview">
                <div className="overview-topbar">
                    <div>
                        {`User: ${user}`}
                    </div>
                    {serverInfo?.serverName
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
                        <button className="btn" onClick={getCurrentVoiceChannel}>
                            Refresh voice channel
                        </button>
                    </div>
                </div>
                <Playlists />
                <Player />
            </div>
        </PlayStateManager>
    ) : null;
}