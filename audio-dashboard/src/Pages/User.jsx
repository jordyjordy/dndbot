import { useEffect, useRef, useState } from "react"

export default function User() {
    const isFetching = useRef(false);
    const [data, setData] = useState([]); 
    useEffect(() => {
        if(!isFetching.current) {
            isFetching.current = true;
            if(localStorage.getItem('sessionId')) {

                fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/user/guilds`, {
                    headers: {
                        'session-id': localStorage.getItem('sessionId'),
                    }
                }).then(async res => {
                    const json = await res.json();
                    setData(json);
                })
            }
        }
    }, [])

    return (
        <>
            <div>User</div>
            <div>{Object.keys(data).map((index) => JSON.stringify(data[index]))}</div>
        </>

    )
}