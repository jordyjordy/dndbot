import React, { useMemo } from 'react';
import { play, pause, playSkipBack, playSkipForward, shuffle, repeat, stop } from 'ionicons/icons';
import './Player.scss';
import { IonIcon } from '@ionic/react';
import { request } from '../utils/network';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../utils/store';
import { setLoop, setShuffle } from '../reducers/playStatus/actions';

const Player = ({ playlists, playSong }: any): JSX.Element => {
    const dispatch = useDispatch();

    const {
        serverId,
        playStatus,
        currentPlaylist,
        currentSong,
    } = useSelector(
        (state: RootState) => {
            return {
                serverId: state?.serverInfo?.serverId,
                playStatus: state?.playStatus,
                currentPlaylist: state.playStatus.playlist,
                currentSong: state.playStatus.song,
            };
        },
    );

    const playlist = useMemo(() => {
        return playlists.find((pl: any) => pl._id === currentPlaylist);
    }, [playlists, currentPlaylist]);

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

    const previousSong = (): void => {
        playSong((currentSong - 1) % playlist.queue.length);
    };

    const nextSong = (): void => {
        playSong((currentSong + 1) % playlist.queue.length);
    };

    const toggleShuffle = (): void => {
        console.log('toggling shuffle');
        console.log(playStatus.shuffle);
        dispatch(setShuffle(!playStatus.shuffle));
    };

    const toggleRepeat = (): void => {
        dispatch(setLoop(!playStatus.loop));
    };

    return (
        <div className='music-player'>
            <div>
                <button onClick={() => { sendAction('STOP'); }} className='musicbtn'>
                    <IonIcon icon={stop} />
                </button>
                <button onClick={() => { previousSong(); }} className='musicbtn'>
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
                <button onClick={() => { nextSong(); }} className='musicbtn'>
                    <IonIcon icon={playSkipForward} />
                </button>
            </div>
            <div>
                <button onClick={() => { toggleShuffle(); }} className={`musicbtn ${playStatus.shuffle ? 'active' : ''}`}>
                    <IonIcon icon={shuffle} />
                </button>
                <button onClick={() => { toggleRepeat(); }} className={`musicbtn ${playStatus.loop ? 'active' : ''}`}>
                    <IonIcon icon={repeat} />
                </button>

            </div>
        </div>
    );
};

export default Player;
