import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { request } from '../utils/network';

export default function Redirect (): JSX.Element {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    useEffect(() => {
        if (searchParams.get('code') !== undefined) {
            request(`/getaccess?code=${searchParams.get('code') as string}&redirect_uri=${encodeURIComponent(`${window.location.origin}/redirect`)}`).then((res) => {
                navigate('/overview', { replace: true });
            }).catch(err => {
                console.error(err);
            });
        }
    }, []);
    return (
        <div>Redirect</div>
    );
}
