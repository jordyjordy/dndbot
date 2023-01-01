import React, { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom"

export default function Redirect() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const isFetching = useRef(false);
    useEffect(() => {
        if(isFetching.current === false) {
            isFetching.current = true;
            fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/token/discord?code=${searchParams.get("code")}`, { credentials: 'include' }).then(async res => {
                navigate('/overview', { replace: true });
            }); 
        }
    }, [searchParams, navigate]);
    return (
        <div>Redirect</div>
    )
}