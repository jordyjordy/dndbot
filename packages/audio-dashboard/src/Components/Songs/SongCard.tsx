
import React from 'react';
import { Playlist } from '../../reducers/playlists/playlistReducer';
import { RootState } from '../../utils/store';
import { useSelector } from 'react-redux';
import { IonIcon } from '@ionic/react';
import { play } from 'ionicons/icons';

interface SongCardProps {
    item: Playlist['queue'][number]
    index: number
    action: (index: number, otherArg?: unknown) => void
}

const selector = (state: RootState): {
    playStatus: RootState['playStatus']
    activePlaylist: RootState['playlists']['activePlaylist']
    serverId: RootState['serverInfo']['serverId']
} => ({
    playStatus: state.playStatus,
    activePlaylist: state.playlists.activePlaylist,
    serverId: state.serverInfo.serverId,
});

const SongCard = ({ item: song, index, action }: SongCardProps): JSX.Element => {
    const { playStatus, activePlaylist } = useSelector(selector);

    return (
        <div className={`song-card ${playStatus.song === index && activePlaylist === (playStatus.playlist ?? 0) ? 'active' : ''}`} key={song._id}>
            <div className='left-block'>
                <div onClick={() => { action(index, activePlaylist); }} className='play-button'>
                    <IonIcon icon={play} />
                </div>
                <div className='card-name'>
                    {song.name}
                </div>
            </div>
        </div>
    );
};

export default SongCard;
