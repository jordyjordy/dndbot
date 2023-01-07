import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import CreatePlaylistModal from './CreatePlaylistModal';
import { RootState } from '../../utils/store';
import PlaylistCard from './PlaylistCard';
import { DraggableList } from '../DraggableList';

const selector = (state: RootState): {
    serverId: RootState['serverInfo']['serverId']
    playlists: RootState['playlists']['playlists']
    playStatus: RootState['playStatus']
} => {
    return {
        serverId: state?.serverInfo?.serverId,
        playlists: state.playlists.playlists,
        playStatus: state?.playStatus,
    };
};

export default function PlaylistList (): JSX.Element {
    const { serverId, playlists } = useSelector(selector);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);

    return (
        <div className='playlists'>
            <h2>Playlists</h2>
            <div className='playlist-container'>
                <DraggableList
                    itemKey='_id'
                    list={playlists}
                    template={PlaylistCard}
                />
                {serverId !== undefined && serverId !== '' && (
                    <>
                        <button className='dndbtn' onClick={() => { setShowPlaylistModal(true); }}>Add playlist</button>
                        <CreatePlaylistModal isOpen={showPlaylistModal} close={() => { setShowPlaylistModal(false); }} fromUrl={true} />
                    </>
                )}
            </div>
        </div>
    );
}
