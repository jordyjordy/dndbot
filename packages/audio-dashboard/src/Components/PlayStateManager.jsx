import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setPlayStatus } from '../reducers/playStatus/actions';

export default function PlayStateManager({ children }) {
    const sse = useRef();
    const dispatch = useDispatch();

    const { serverId} = useSelector((state) =>({
        serverId: state.serverInfo.serverId
    }));

    useEffect(() => {
        if(!serverId) {
            return;
        }
        sse.current = new EventSource(`${process.env.REACT_APP_SERVER_ADDRESS}/music/update?serverId=${serverId}`, { withCredentials: true });
        sse.current.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            data.playlist = parseInt(data.playlist);
            data.song = parseInt(data.song);
            console.log(data);
            dispatch(setPlayStatus(data));
        });

        return () => {
            sse.current?.close();
        }
    }, [serverId, dispatch]);
    return children;
}
