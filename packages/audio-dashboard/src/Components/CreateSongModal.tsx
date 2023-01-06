import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Input, Label, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { request } from '../utils/network';
import { useDispatch, useSelector } from 'react-redux';
import { setPlaylists } from '../reducers/playlists/actions';
import { RootState } from '../utils/store';

const selector = (state: RootState): {
    serverId: RootState['serverInfo']['serverId']
} => ({
    serverId: state.serverInfo.serverId,
});

interface CreateSongModalProps {
    isOpen: boolean
    close: VoidFunction
    currentPlaylist: number
}

const CreateSongModal = ({ isOpen, close, currentPlaylist }: CreateSongModalProps): JSX.Element => {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');

    const { serverId } = useSelector(selector);
    const dispatch = useDispatch();

    const handleClose = (): void => {
        setName('');
        setUrl('');
        close();
    };

    const handleCreate = (): void => {
        request('/songs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ songUrl: url, songName: name, playlistIndex: currentPlaylist, serverId }),
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
                <Label>name</Label>
                <Input onChange={(e) => { setName(e.target.value); }} value={name}/>
                <Label>youtube url</Label>
                <Input onChange={(e) => { setUrl(e.target.value); }} value={url}/>
                <button onClick={handleCreate} className='dndbtn mt-2'>
                    Create
                </button>
            </ModalBody>
        </Modal>
    );
};

CreateSongModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    close: PropTypes.func.isRequired,
    currentPlaylist: PropTypes.number.isRequired,
};

export default CreateSongModal;
