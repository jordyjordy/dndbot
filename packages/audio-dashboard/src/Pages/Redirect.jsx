import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom"

export default function Redirect() {
    const navigate = useNavigate();
    useEffect(() => {
        navigate('/overview', { replace: true });
    }, [navigate]);
    return (
        <div>Redirect</div>
    )
}