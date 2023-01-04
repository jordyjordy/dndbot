/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"
import { request } from "../utils/network";

export default function Redirect() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    useEffect(() => {
        request(`/getaccess?code=${searchParams.get('code')}&redirect_uri=${encodeURIComponent(`${window.location.origin}/redirect`)}`).then((res) => {
            navigate('/overview', { replace: true });
        })

    }, []);
    return (
        <div>Redirect</div>
    )
}