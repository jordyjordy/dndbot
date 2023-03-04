import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import CreatePlaylistModal from './CreatePlaylistModal';
import { RootState } from '../../utils/store';
import PlaylistCard from './PlaylistCard';
import { DraggableList } from '../DraggableList';
import './Resizer.scss';
import { IonIcon } from '@ionic/react';
import { add } from 'ionicons/icons';

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
    const [width, setWidth] = useState(300);
    return (
        <div style={{ flex: `0 1 ${width}px` }}className='playlists-container'>
            <div className='playlists'>
                <div className='d-flex align-items-center justify-content-center title-container'>
                    <span className='playlist-title'>Playlists</span>
                    {serverId !== undefined && serverId !== '' && (
                        <>
                            <button className='dndbtn' onClick={() => { setShowPlaylistModal(true); }}>
                                <IonIcon icon={add} />
                            </button>
                            <CreatePlaylistModal isOpen={showPlaylistModal} close={() => { setShowPlaylistModal(false); }} fromUrl={true} />
                        </>
                    )}
                </div>
                <div className='playlist-container'>
                    <DraggableList
                        itemKey='_id'
                        list={playlists}
                        template={PlaylistCard}
                        className='playlist-list'
                    />
                </div>
            </div>
            <div className='resizer' onMouseDown={(e) => {
                const start = e.clientX;
                e.preventDefault();
                e.stopPropagation();

                const onMouseMove = (e: MouseEvent): void => {
                    const change = e.clientX - start;
                    const newWidth = Math.min(Math.max(250, width + change), 700);
                    setWidth(newWidth);
                };

                const onMouseUp = (e: MouseEvent): void => {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                };
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            }}>
                <div className='drag'>
                </div>
            </div>
        </div>
    );
}
