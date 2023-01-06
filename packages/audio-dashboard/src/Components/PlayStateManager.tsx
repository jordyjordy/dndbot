import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPlayStatus } from '../reducers/playStatus/actions';
import { RootState } from '../utils/store';

interface PlayStateManagerProps {
    children: JSX.Element
}

const selector = (state: RootState): { serverId: string } => ({
    serverId: state.serverInfo.serverId,
});

export default function PlayStateManager ({ children }: PlayStateManagerProps): JSX.Element {
    const sse = useRef<EventSource>();
    const dispatch = useDispatch();

    const { serverId } = useSelector(selector);

    useEffect(() => {
        if (process.env.REACT_APP_SERVER_ADDRESS === undefined) {
            console.error('Server address not set');
            return;
        }
        if (serverId === '' || serverId === 'undefined') {
            return;
        }
        sse.current = new EventSource(`${process.env.REACT_APP_SERVER_ADDRESS}/music/update?serverId=${serverId}`, { withCredentials: true });
        sse.current.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            data.playlist = parseInt(data.playlist);
            data.song = parseInt(data.song);
            dispatch(setPlayStatus(data));
        });

        return () => {
            sse.current?.close();
        };
    }, [serverId, dispatch]);
    return children;
}
