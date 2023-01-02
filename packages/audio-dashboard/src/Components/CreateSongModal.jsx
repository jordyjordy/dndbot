//test

import React, { useState } from 'react';
import { Input, Label, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { request } from '../utils/network';
import { useDispatch, useSelector } from 'react-redux';
import { setPlaylists } from '../reducers/playlists/actions';

const selector = (state) => ({
    serverId: state.serverInfo.serverId,
})

const CreateSongModal = ({ isOpen, close, currentPlaylist }) => {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');

    const { serverId } = useSelector(selector);
    const dispatch = useDispatch();

    const handleClose = () => {
        setName('');
        setUrl('');
        close();
    }

    const handleCreate = () => {
        request('/songs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ songUrl: url, songName: name, playlistIndex: currentPlaylist, serverId })
        }).then(async (res) => {
            const data = await res.json();
            dispatch(setPlaylists(data.playlists));
            handleClose();
        })
    }
    return (
        <Modal contentClassName='dark-modal' isOpen={isOpen}>
            <ModalHeader toggle={handleClose}>
                Create a new playlist
            </ModalHeader>
            <ModalBody>
                <Label>name</Label>
                <Input onChange={(e) => setName(e.target.value)} value={name}/>
                <Label>youtube url</Label>
                <Input onChange={(e) => setUrl(e.target.value)} value={url}/>
                <button onClick={handleCreate} className='dndbtn mt-2'>
                    Create
                </button>
            </ModalBody>
        </Modal>
    )
};

export default CreateSongModal;