// Home component
import React, { useContext, useEffect, useState } from 'react';
import RoomClientContext from '../contexts/RoomClientContext';
import { useNavigate } from 'react-router-dom';
import { ErrorContext } from '../contexts/ErrorContext';
import { Button, Box, CircularProgress } from '@mui/material';

interface HomeProps {
    username: string,
}

export const Home: React.FC<HomeProps> = ({ username }) => {
    const navigate = useNavigate();
    const roomClient = useContext(RoomClientContext);
    const [roomId, setRoomId] = useState('');
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const { errorMessage, setErrorMessage } = useContext(ErrorContext);

    useEffect(() => {
        const handleRoomCreated = (roomId: string) => {
            setRoomId(roomId);
            setIsCreatingRoom(false);
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
            setIsCreatingRoom(true);
            roomClient.createRoom();
        }
    };

    return (
        <Box display="flex" justifyContent="center">
            <Button sx={{
                backgroundColor: '#00612d',
                color: '#fff',
                '&:hover': {
                    backgroundColor: '#008332',
                },
                margin: "20px",
                fontWeight: 'bold',
                width: '140px',
                height: '55px',
                borderRadius: "50px",
            }} onClick={handleCreateRoom} disabled={isCreatingRoom}>
                {isCreatingRoom ? <CircularProgress size={24} color="secondary" /> : "Create Room"}
            </Button>
        </Box>
    )
};
