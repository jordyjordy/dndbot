import React from 'react';
import './ConnectionIndicator.scss';

const ConnectionIndicator = ({ isConnected }: { isConnected: boolean }): JSX.Element => {
    return (
        <div className={`connection-indicator ${isConnected ? 'connected' : ''}`} />
    );
};

export default ConnectionIndicator;
