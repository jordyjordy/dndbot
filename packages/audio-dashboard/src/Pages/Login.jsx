import { useEffect } from "react"
import Cookies from 'js-cookie';
import { useNavigate } from "react-router";

export default function Login() {
    const navigate = useNavigate();
    useEffect(() => {
        if(Cookies.get('access_token')) {
            navigate('/overview')
        }
    }, [navigate])

    return (
        <header className="App-header">
            <button className="dndbtn" onClick={() => {
                    window.location.href = `${process.env.REACT_APP_SERVER_ADDRESS}/login?redirect=${encodeURIComponent(`${window.location.origin}/redirect`)}`
                }}>
                LOGIN
            </button>
        </header>
    )
}