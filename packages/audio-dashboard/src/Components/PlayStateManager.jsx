import React, { useEffect, useRef } from 'react'

export default function PlayStateManager() {
    const sse = useRef();

    useEffect(() => {
        sse.current = new EventSource(`${process.env.REACT_APP_SERVER_ADDRESS}/music/update`, { withCredentials: true });
    }, []);
    return (
        <div>PlayStateManager</div>
    )
}
