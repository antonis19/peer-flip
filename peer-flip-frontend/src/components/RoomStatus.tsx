// src/components/RoomStatus.tsx
import React from 'react';
import UrlCopy from './UrlCopy';

interface RoomStatusProps {
    roomId: string;
    username: string;
    connectedPeers: string[];
}

export const RoomStatus: React.FC<RoomStatusProps> = ({ roomId, username, connectedPeers }) => {
    return (
        <div>
            <h2>Your username: <span style={{ color: '#00612d' }}>{username}</span></h2>
            <h3>Room ID: <span style={{ color: '#00612d' }}>{roomId}</span></h3>
            <UrlCopy />
            <h4>Connected Peers:</h4>
            <ul>
                {connectedPeers.map((peer, index) => (
                    <li key={index}>{peer}</li>
                ))}
            </ul>
        </div>
    );
};
