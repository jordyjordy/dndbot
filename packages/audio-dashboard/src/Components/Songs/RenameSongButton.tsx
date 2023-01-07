import { IonIcon } from '@ionic/react';
import { createOutline } from 'ionicons/icons';
import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, Label, Input } from 'reactstrap';
import { request } from '../../utils/network';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../utils/store';
import { setPlaylists } from '../../reducers/playlists/actions';

interface RenameSongButtonProps {
    song: { name: string }
}

const RenameSongButton = ({ song }: RenameSongButtonProps): JSX.Element => {
    const [name, setName] = useState(song.name);
    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => {
        setName(song.name);
    }, [isOpen]);

    const dispatch = useDispatch();

    const { serverId, activePlaylist } = useSelector((state: RootState) => ({
        serverId: state.serverInfo.serverId,
        activePlaylist: state.playlists.activePlaylist,
    }));

    const handleUpdate = (): void => {
        if (song.name === name) {
            handleClose();
        }
        request('/songs', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ song: { ...song, name }, playlistId: activePlaylist, serverId }),
        }).then(async (res) => {
            const data = await res.json();
            dispatch(setPlaylists(data.playlists));
            handleClose();
        }).catch(err => {
            console.error(err);
        });
    };

    const handleClose = (): void => {
        setName(song.name);
        setIsOpen(false);
    };

    return (
        <>
            <div className='name-edit' onClick={() => { setIsOpen(true); }} title="Edit name">
                <IonIcon color="white" icon={createOutline} />
            </div>
            <Modal contentClassName='dark-modal' isOpen={isOpen}>
                <ModalHeader toggle={handleClose}>
                    Rename song
                </ModalHeader>
                <ModalBody>
                    <Label>name</Label>
                    <Input onChange={(e) => { setName(e.target.value); }} value={name}/>
                    <div className='mt-2'>
                        <button onClick={(handleUpdate)} className='dndbtn me-2'>
                            handleUpdate
                        </button>
                        <button onClick={(handleClose)} className='dndbtn'>
                            Cancel
                        </button>
                    </div>

                </ModalBody>
            </Modal>
        </>
    );
};

export default RenameSongButton;
