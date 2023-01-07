import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../utils/store';
import CreateSongModal from './CreateSongModal';
import SongCard from './SongCard';
import { DraggableList } from '../DraggableList';
import { setPlaylists } from '../../reducers/playlists/actions';
import { request } from '../../utils/network';
import { Playlist } from '../../reducers/playlists/playlistReducer';

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

const SongList = (): JSX.Element => {
    const [showSongModal, setShowSongModal] = useState(false);
    const { serverId, playlists, activePlaylist } = useSelector(selector);
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
            <h2>
            Songs
            </h2>
            <div className='song-container'>
                <DraggableList list={playlists.find(({ _id }) => _id === activePlaylist)?.queue} itemKey="_id" template={SongCard} onDragFinish={handleDragFinish} />
                {serverId !== undefined && serverId.length > 0 && (
                    <>
                        <button onClick={() => { setShowSongModal(true); }} className='dndbtn'>Add song</button>
                        <CreateSongModal isOpen={showSongModal} close={() => { setShowSongModal(false); }} />
                    </>
                )}
            </div>
        </div>
    );
};

export default SongList;
