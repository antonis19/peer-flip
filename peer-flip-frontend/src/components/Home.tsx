// Home component

import React, { useContext, useEffect, useState } from 'react';
import RoomClientContext from '../contexts/RoomClientContext';
import { useNavigate } from 'react-router-dom';
import { ErrorContext } from '../contexts/ErrorContext';
import { Button } from '@mui/material';


interface HomeProps {
    username: string,
}

export const Home: React.FC<HomeProps> = ({ username }) => {
    const navigate = useNavigate();
    const roomClient = useContext(RoomClientContext);
    const [roomId, setRoomId] = useState('');
    const { errorMessage, setErrorMessage } = useContext(ErrorContext);

    useEffect(() => {

        const handleRoomCreated = (roomId: string) => {
            setRoomId(roomId);
        };
        if (roomClient) {
            roomClient.callbacks.onRoomCreated = handleRoomCreated;
        }

        if (roomId) {
            navigate(`/${roomId}`);
        }
    }, [roomId, roomClient]);


    const handleCreateRoom = () => {
        if (roomClient) {
            roomClient.createRoom();
        }
    };

    return (
        <div>
            <Button sx={{
                backgroundColor: '#6f51b5',
                color: '#fff',
                '&:hover': {
                    backgroundColor: '#6f50a5',
                },
                margin: "20px",
            }} onClick={handleCreateRoom}>
                Create Link
            </Button>
            {roomId && <h4>{username} joined Room {roomId}</h4>}
        </div>
    )
};
