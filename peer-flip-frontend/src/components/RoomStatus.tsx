// src/components/RoomStatus.tsx
import React from 'react';

interface RoomStatusProps {
    roomId: string;
    connectedPeers: string[];
}

export const RoomStatus: React.FC<RoomStatusProps> = ({ roomId, connectedPeers }) => {
    return (
        <div>
            <h3>Room: {roomId}</h3>
            <h4>Connected Peers:</h4>
            <ul>
                {connectedPeers.map((peer, index) => (
                    <li key={index}>{peer}</li>
                ))}
            </ul>
        </div>
    );
};
