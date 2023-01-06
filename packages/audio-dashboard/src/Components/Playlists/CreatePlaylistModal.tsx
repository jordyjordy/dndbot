import React, { useState } from 'react';
import { Alert, Input, Label, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { request } from '../../utils/network';
import { useDispatch, useSelector } from 'react-redux';
import { setPlaylists } from '../../reducers/playlists/actions';
import { RootState } from '../../utils/store';
import { setLoadingStatus } from '../../reducers/requestStatus/actions';

const selector = (state: RootState): {
    serverId: RootState['serverInfo']['serverId']
} => ({
    serverId: state.serverInfo.serverId,
});

interface CreatePlaylistModalProps {
    close: () => void
    isOpen: boolean
    fromUrl?: boolean
}
const CreatePlaylistModal = ({ close, isOpen, fromUrl = false }: CreatePlaylistModalProps): JSX.Element => {
    const [name, setName] = useState('');
    const [url, setUrl] = useState<string>();
    const [hasError, setHasError] = useState(false);
    const { serverId } = useSelector(selector);
    const dispatch = useDispatch();

    const handleClose = (): void => {
        setName('');
        setUrl(undefined);
        setHasError(false);
        close();
    };

    const handleCreate = (): void => {
        dispatch(setLoadingStatus(true));
        request('/playlists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, serverId, url }),
        }).then(async (res) => {
            const data = await res.json();
            setHasError(false);
            dispatch(setPlaylists(data.playlists));
            handleClose();
        }).catch(err => {
            setHasError(true);
            console.error(err);
        }).finally(() => {
            dispatch(setLoadingStatus(false));
        });
    };

    return (
        <Modal contentClassName='dark-modal' isOpen={isOpen}>
            <ModalHeader toggle={handleClose}>
                Create a new playlist
            </ModalHeader>
            <ModalBody>
                <Label>Playlist name</Label>
                <Input onChange={(e) => { setName(e.target.value); }} value={name}/>
                {fromUrl && (
                    <>
                        <Label>Url (optional)</Label>
                        <Input onChange={(e) => { setUrl(e.target.value); }} value={url ?? ''}/>
                    </>
                )}
                <button onClick={handleCreate} className='dndbtn mt-2'>
                    Create
                </button>
                {hasError && (
                    <Alert className='mt-2' color='danger'>Something went wrong</Alert>
                )}
            </ModalBody>
        </Modal>
    );
};

export default CreatePlaylistModal;
