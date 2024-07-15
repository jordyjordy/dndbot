import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../utils/store';
import CreateSongModal from './CreateSongModal';
import SongCard from './SongCard';
import { DraggableList } from '../DraggableList';
import { setPlaylists } from '../../reducers/playlists/actions';
import { request } from '../../utils/network';
import { Playlist } from '../../reducers/playlists/playlistReducer';
import { IonIcon } from '@ionic/react';
import { add } from 'ionicons/icons';

const selector = (state: RootState): {
    serverId: RootState['serverInfo']['serverId']
    playlists: RootState['playlists']['playlists']
    playStatus: RootState['playStatus']
    activePlaylist: RootState['playlists']['activePlaylist']
} => {
    return {
        serverId: state.serverInfo?.serverId,
        playlists: state.playlists.playlists,
        playStatus: state.playStatus,
        activePlaylist: state.playlists.activePlaylist,
    };
};

const SongList = ({ playlists, playSong }: { playlists: any[], playSong: (val: number) => void }): JSX.Element => {
    const [showSongModal, setShowSongModal] = useState(false);
    const { serverId, activePlaylist } = useSelector(selector);

    const dispatch = useDispatch();
    const handleDragFinish = (songs: any[]): void => {
        const playlist = playlists.find(({ _id }) => _id === activePlaylist) as Playlist;
        playlist.queue = songs;
        request('/playlists', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playlist, serverId }),
        }).then(async (res: any) => {
            const data = await res.json();
            dispatch(setPlaylists(data.playilsts));
        }).catch((err) => {
            console.log(err);
        });
    };

    return (
        <div className='songs'>
            <div className='d-flex align-items-center justify-content-center title-container'>
                <span className='playlist-title'>Songs</span>
                {serverId !== undefined && serverId !== '' && (
                    <>
                        <button onClick={() => { setShowSongModal(true); }} className='dndbtn'>
                            <IonIcon icon={add} />
                        </button>
                        <CreateSongModal isOpen={showSongModal} close={() => { setShowSongModal(false); }} />
                    </>
                )}
            </div>
            <div className='song-container'>
                <DraggableList
                    list={playlists.find(({ _id }) => _id === activePlaylist)?.queue}
                    itemKey="_id"
                    template={SongCard}
                    onDragFinish={handleDragFinish}
                    className='song-list'
                    action={playSong}
                />
            </div>
        </div>
    );
};

export default SongList;
