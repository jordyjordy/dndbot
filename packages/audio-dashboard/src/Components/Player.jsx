import React from 'react';
import { play, pause, playSkipBack, playSkipForward, shuffle, repeat, stop } from 'ionicons/icons';
import './Player.scss';
import { IonIcon } from '@ionic/react';
import { request } from '../utils/network';
import { useDispatch, useSelector } from 'react-redux';
import { setPlayStatus } from '../reducers/playStatus/actions';

export default function Player() {
    const dispatch = useDispatch();
    const { serverId, playStatus } = useSelector((state) => { return { serverId: state?.serverInfo?.serverId, playStatus: state?.playStatus } });
    const sendAction = (action) => {
        request('/music/action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action, serverId }),
        }).then(async (res) => {
            // const json = await res.json();
            // dispatch(setPlayStatus(json));
        })
    }

    return (
        <div className='music-player'>
            <div>
                <button onClick={() => sendAction('STOP')} className='btn'>
                    <IonIcon icon={stop} />
                </button>
                <button onClick={() => sendAction('PREVIOUSSONG')} className='btn'>
                    <IonIcon icon={playSkipBack} />
                </button>
                {playStatus.playing
                    ? (
                        <button onClick={() => sendAction('PAUSE')} className='btn'>
                            <IonIcon icon={pause} />
                        </button>
                    )
                    : (

                        <button onClick={() => sendAction('PLAY')} className='btn'>
                            <IonIcon icon={play} />
                        </button>
                    )}
                <button onClick={() => sendAction('NEXTSONG')} className='btn'>
                    <IonIcon icon={playSkipForward} />
                </button>
            </div>
            <div>
                <button onClick={() => sendAction('TOGGLESHUFFLE')} className={`btn ${playStatus.shuffle ? 'active' : ''}`}>
                    <IonIcon icon={shuffle} />
                </button>
                <button onClick={() => sendAction('TOGGLEREPEAT')} className={`btn ${playStatus.loop ? 'active' : ''}`}>
                    <IonIcon icon={repeat} />
                </button>
            </div>
        </div>
    )
}
