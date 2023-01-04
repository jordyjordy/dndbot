import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"
import { request } from "../utils/network";

export default function Redirect() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    useEffect(() => {
        console.log(searchParams);
        request(`/getAccess?code=${searchParams.code}`,)
        navigate('/overview', { replace: true });
    }, [navigate, searchParams.code]);
    return (
        <div>Redirect</div>
    )
}