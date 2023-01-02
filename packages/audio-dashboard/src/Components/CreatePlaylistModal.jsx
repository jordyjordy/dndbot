import React, { useState } from 'react'
import { Input, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { request } from '../utils/network';
import { useDispatch, useSelector } from 'react-redux';
import { setPlaylists } from '../reducers/playlists/actions';


const selector = (state) => ({
    serverId: state.serverInfo.serverId,
})
export default function CreatePlaylistModal({ close, isOpen }) {

    const [name, setName] = useState('');
    const { serverId } = useSelector(selector);
    const dispatch = useDispatch();

    const handleClose = () => {
        setName('');
        close();
    }

    const handleCreate = () => {
        request('/playlists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, serverId }),
        }).then(async (res) => {
            const data = await res.json();
            dispatch(setPlaylists(data.playlists));
            handleClose();
        });
    }

    return (
        <Modal contentClassName='dark-modal' isOpen={isOpen}>
            <ModalHeader toggle={handleClose}>
                Create a new playlist
            </ModalHeader>
            <ModalBody>
                <Input onChange={(e) => setName(e.target.value)} value={name}/>
                <button onClick={handleCreate} className='dndbtn mt-2'>
                    Create
                </button>
            </ModalBody>
        </Modal>
    )
}
