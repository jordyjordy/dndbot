import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../utils/store';
import CreateSongModal from './CreateSongModal';
import SongCard from './SongCard';

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
    return (
        <div className='songs'>
            <h2>
            Songs
            </h2>
            <div className='song-container'>
                {playlists[activePlaylist]?.queue?.map((song, index) => {
                    return (
                        <SongCard key={song._id} song={song} index={index} />
                    );
                })}
                {serverId !== undefined && serverId.length > 0 && (
                    <>
                        <button onClick={() => { setShowSongModal(true); }} className='dndbtn'>Add song</button>
                        <CreateSongModal isOpen={showSongModal} close={() => { setShowSongModal(false); }} currentPlaylist={activePlaylist} />
                    </>
                )}
            </div>
        </div>
    );
};

export default SongList;
