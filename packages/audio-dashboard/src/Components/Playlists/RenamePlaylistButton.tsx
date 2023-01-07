import { IonIcon } from '@ionic/react';
import { createOutline } from 'ionicons/icons';
import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, Label, Input } from 'reactstrap';
import { request } from '../../utils/network';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../utils/store';
import { setPlaylists } from '../../reducers/playlists/actions';

interface RenamePlaylistButtonProps {
    playlist: { name: string }
}

const RenamePlaylistButton = ({ playlist }: RenamePlaylistButtonProps): JSX.Element => {
    const [name, setName] = useState(playlist.name);
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();
    const { serverId } = useSelector((state: RootState) => ({
        serverId: state.serverInfo.serverId,
    }));
    const handleUpdate = (): void => {
        if (playlist.name === name) {
            handleClose();
        }
        request('/playlists', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playlist: { ...playlist, name }, serverId }),
        }).then(async (res) => {
            const data = await res.json();
            dispatch(setPlaylists(data.playlists));
            handleClose();
        }).catch(err => {
            console.error(err);
        });
    };

    const handleClose = (): void => {
        setName(playlist.name);
        setIsOpen(false);
    };

    return (
        <>
            <div className='name-edit' onClick={() => { setIsOpen(true); }} title="Edit name">
                <IonIcon color="white" icon={createOutline} />
            </div>
            <Modal contentClassName='dark-modal' isOpen={isOpen}>
                <ModalHeader toggle={handleClose}>
                    Rename playlist
                </ModalHeader>
                <ModalBody>
                    <Label>name</Label>
                    <Input onChange={(e) => { setName(e.target.value); }} value={name}/>
                    <div className='mt-2'>
                        <button onClick={(handleUpdate)} className='dndbtn me-2'>
                            Save
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

export default RenamePlaylistButton;
