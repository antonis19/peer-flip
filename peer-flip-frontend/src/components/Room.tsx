import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import CoinFlip from './CoinFlip';
import RoomClientContext from '../contexts/RoomClientContext';
import { ErrorContext } from '../contexts/ErrorContext';
import { LoadingButton } from '@mui/lab';
import { RoomStatus } from './RoomStatus';
import UrlCopy from './UrlCopy';
import { RoomContext } from '../contexts/RoomContext';


interface RoomProps {
    username: string;
    connectedPeers: string[];
}

const Room: React.FC<RoomProps> = ({ username, connectedPeers }) => {
    const { roomId } = useParams();
    const roomClient = useContext(RoomClientContext);
    const { errorMessage, setErrorMessage } = useContext(ErrorContext);
    const roomContext = useContext(RoomContext);

    if (!roomContext) {
        throw new Error('RoomContext is undefined');
    }
    const { joining, setJoining, joined, setJoined } = roomContext;

    useEffect(() => {
        if (!username) {
            return;
        }
        console.log(`INSIDE Room.useEffect() joined `)
        if (!joined && !joining && roomClient && roomId) {
            console.log("Not Joined, Trying to join with username " + username);
            setJoining(true);
        } else if (joining && roomId && roomClient) {
            roomClient.joinRoom(roomId);
        }

        const handleRoomJoined = (roomId: string, userId: string) => {
            console.log(`User ${userId} joined this room!`);
            if (userId == username) {
                setJoining(false);
                setJoined(true);
            }
        };

        if (roomClient) {
            console.log("RoomClient socket ready state = " + roomClient.socket.readyState);
            roomClient.callbacks.onRoomJoined = handleRoomJoined;
        }

    }, [username, roomId, joined, joining, roomClient]);


    if (joined && roomClient) {
        return (
            <div>
                <UrlCopy />
                <RoomStatus roomId={roomId!} connectedPeers={connectedPeers} />
            </div>
        );
    }
    return <div />;
};

export default Room;
