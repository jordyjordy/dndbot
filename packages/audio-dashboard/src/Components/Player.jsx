import React from 'react';
import { play, pause, playSkipBack, playSkipForward, shuffle, repeat, stop } from 'ionicons/icons';
import './Player.scss';
import { IonIcon } from '@ionic/react';
import { request } from '../utils/network';
import { useSelector } from 'react-redux';

export default function Player() {
    const { serverId, playStatus } = useSelector((state) => { return { serverId: state?.serverInfo?.serverId, playStatus: state?.playStatus } });
    const sendAction = (action) => {
        request('/music/action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action, serverId }),
        })
    }

    return (
        <div className='music-player'>
            <div>
                <button onClick={() => sendAction('STOP')} className='dndbtn'>
                    <IonIcon icon={stop} />
                </button>
                <button onClick={() => sendAction('PREVIOUSSONG')} className='dndbtn'>
                    <IonIcon icon={playSkipBack} />
                </button>
                {playStatus.playing
                    ? (
                        <button onClick={() => sendAction('PAUSE')} className='dndbtn'>
                            <IonIcon icon={pause} />
                        </button>
                    )
                    : (

                        <button onClick={() => sendAction('PLAY')} className='dndbtn'>
                            <IonIcon icon={play} />
                        </button>
                    )}
                <button onClick={() => sendAction('NEXTSONG')} className='dndbtn'>
                    <IonIcon icon={playSkipForward} />
                </button>
            </div>
            <div>
                <button onClick={() => sendAction('TOGGLESHUFFLE')} className={`dndbtn ${playStatus.shuffle ? 'active' : ''}`}>
                    <IonIcon icon={shuffle} />
                </button>
                <button onClick={() => sendAction('TOGGLEREPEAT')} className={`dndbtn ${playStatus.loop ? 'active' : ''}`}>
                    <IonIcon icon={repeat} />
                </button>
            </div>
        </div>
    )
}
