import { useEffect, useRef, useState } from "react"

export default function User() {
    const isFetching = useRef(false);
    const [data, setData] = useState(); 
    const [user, setUser] = useState();
    useEffect(() => {
        if(!isFetching.current) {
            isFetching.current = true;
            if(localStorage.getItem('sessionId')) {
                fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/user`, {
                    headers: {
                        'session-id': localStorage.getItem('sessionId'),
                    }
                }).then(async res => {
                    const { username } = await res.json();
                    setUser(username)
                })
            }
        }
    }, [])

    const getCurrentVoiceChannel = () => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/user/voicechannel`, {
            headers: {
                'session-id': localStorage.getItem('sessionId'),
            }
        }).then(async res => {
            const json = await res.json();
            setData(json);
        })
    }

    const joinVoiceChannel = () => {
        try {
            fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/bot/joinchannel`, {
                method: 'POST',
                headers: {
                    'session-id': localStorage.getItem('sessionId'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
            })
        } catch (err) {
            console.log('aaa', err);
        }

    }

    return (
        <>
            <div>
                {`User: ${user}`}
            </div>
            <button onClick={getCurrentVoiceChannel}>
                Detect voice channel
            </button>
            {data && (
                <>
                    <div>{`Server Name: ${data?.serverName}`}</div>
                    <div>{`Voice Channel: ${data?.voiceChannelName}`}</div>
                    <button onClick={joinVoiceChannel}>Play music in current voice channel</button>
                </>
            )}
        </>

    )
}