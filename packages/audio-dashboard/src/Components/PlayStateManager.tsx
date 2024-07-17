import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPlayStatus, setSongEnded } from '../reducers/playStatus/actions';
import { RootState } from '../utils/store';
import { isEmpty } from 'lodash';

interface PlayStateManagerProps {
    children: JSX.Element
}

const selector = (state: RootState): {
    serverId: RootState['serverInfo']['serverId']
    playStatus: RootState['playStatus']
} => ({
    serverId: state.serverInfo.serverId,
    playStatus: state.playStatus,
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
        if (serverId === '' || serverId === 'undefined' || serverId === undefined) {
            return;
        }
        sse.current = new EventSource(`${process.env.REACT_APP_SERVER_ADDRESS}/music/update?serverId=${serverId}`, { withCredentials: true });
        sse.current.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            if (data.songEnded) {
                dispatch(setSongEnded(true));
            }
            if (!isEmpty(data)) {
                dispatch(setPlayStatus(data));
            }
        });

        return () => {
            sse.current?.close();
        };
    }, [serverId, dispatch]);
    return children;
}
