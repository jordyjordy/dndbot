import React, { useState } from 'react';
import { Input, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { request } from '../utils/network';
import { useDispatch, useSelector } from 'react-redux';
import { setPlaylists } from '../reducers/playlists/actions';
import { RootState } from '../utils/store';

const selector = (state: RootState): {
    serverId: RootState['serverInfo']['serverId']
} => ({
    serverId: state.serverInfo.serverId,
});

interface CreatePlaylistModalProps {
    close: () => void
    isOpen: boolean
}
const CreatePlaylistModal = ({ close, isOpen }: CreatePlaylistModalProps): JSX.Element => {
    const [name, setName] = useState('');
    const { serverId } = useSelector(selector);
    const dispatch = useDispatch();

    const handleClose = (): void => {
        setName('');
        close();
    };

    const handleCreate = (): void => {
        request('/playlists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, serverId }),
        }).then(async (res) => {
            const data = await res.json();
            dispatch(setPlaylists(data.playlists));
            handleClose();
        }).catch(err => {
            console.error(err);
        });
    };

    return (
        <Modal contentClassName='dark-modal' isOpen={isOpen}>
            <ModalHeader toggle={handleClose}>
                Create a new playlist
            </ModalHeader>
            <ModalBody>
                <Input onChange={(e) => { setName(e.target.value); }} value={name}/>
                <button onClick={handleCreate} className='dndbtn mt-2'>
                    Create
                </button>
            </ModalBody>
        </Modal>
    );
};

export default CreatePlaylistModal;
