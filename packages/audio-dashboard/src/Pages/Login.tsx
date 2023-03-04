import React, { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router';

export default function Login (): JSX.Element {
    const navigate = useNavigate();
    useEffect(() => {
        if (Cookies.get('access_token') !== undefined) {
            navigate('/overview');
        }
    }, [navigate]);

    return (
        <header className="App-header">
            <h1>
                D&D Music bot <small>(tm pending)</small>
            </h1>
            <img className='login-logo' src="/android-chrome-512x512.png" />
            {process.env.REACT_APP_SERVER_ADDRESS !== undefined
                ? (
                    <button className="dndbtn login-btn" onClick={() => {
                        window.location.href = `${process.env.REACT_APP_SERVER_ADDRESS as string}/login?redirect=${encodeURIComponent(`${window.location.origin}/redirect`)}`;
                    }}>
                        LOGIN
                    </button>
                )
                : (
                    <h1 className='dndbtn'>Sorry The service is currently unavailable</h1>
                )}

        </header>
    );
}
