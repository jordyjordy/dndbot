import React from 'react';
import { play, pause, playSkipBack, playSkipForward, shuffle, repeat, stop } from 'ionicons/icons';
import './Player.scss';
import { IonIcon } from '@ionic/react';
import { request } from '../utils/network';
import { useSelector } from 'react-redux';
import { RootState } from '../utils/store';

const Player = (): JSX.Element => {
    const { serverId, playStatus } = useSelector((state: RootState) => { return { serverId: state?.serverInfo?.serverId, playStatus: state?.playStatus }; });
    const sendAction = (action: string): void => {
        request('/music/action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action, serverId }),
        }).catch(err => {
            console.error(err);
        });
    };

    return (
        <div className='music-player'>
            <div>
                <button onClick={() => { sendAction('STOP'); }} className='musicbtn'>
                    <IonIcon icon={stop} />
                </button>
                <button onClick={() => { sendAction('PREVIOUSSONG'); }} className='musicbtn'>
                    <IonIcon icon={playSkipBack} />
                </button>
                {playStatus.playing
                    ? (
                        <button onClick={() => { sendAction('PAUSE'); }} className='musicbtn'>
                            <IonIcon icon={pause} />
                        </button>
                    )
                    : (

                        <button onClick={() => { sendAction('PLAY'); }} className='musicbtn'>
                            <IonIcon icon={play} />
                        </button>
                    )}
                <button onClick={() => { sendAction('NEXTSONG'); }} className='musicbtn'>
                    <IonIcon icon={playSkipForward} />
                </button>
            </div>
            <div>
                <button onClick={() => { sendAction('TOGGLESHUFFLE'); }} className={`musicbtn ${playStatus.shuffle ? 'active' : ''}`}>
                    <IonIcon icon={shuffle} />
                </button>
                <button onClick={() => { sendAction('TOGGLEREPEAT'); }} className={`musicbtn ${playStatus.loop ? 'active' : ''}`}>
                    <IonIcon icon={repeat} />
                </button>
            </div>
        </div>
    );
};

export default Player;
