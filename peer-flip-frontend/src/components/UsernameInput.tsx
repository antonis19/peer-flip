import { TextField, Button } from '@mui/material';
import React, { useContext, useState } from 'react';
import { ErrorContext } from '../contexts/ErrorContext';

interface UsernameInputProps {
    setUsername: (username: string) => void;
}

export const UsernameInput: React.FC<UsernameInputProps> = ({ setUsername }) => {
    const [inputValue, setInputValue] = useState('');
    const { errorMessage, setErrorMessage } = useContext(ErrorContext);

    function handleClick(inputValue: string) {
        if (errorMessage) {
            setErrorMessage('');
        }
        setUsername(inputValue);
    }

    return (
        <div>
            <TextField
                id="username-input"
                label="Username"
                sx={{
                    width: '60%',
                }}
                InputProps={{
                    sx: {
                        height: 40,
                        marginTop: '5px',
                        backgroundColor: '#f1f1f1'
                    },
                }}
                onChange={(e) => setInputValue(e.target.value)}
            />
            <Button sx={{
                backgroundColor: '#00612d',
                color: '#fff',
                '&:hover': {
                    backgroundColor: '#00612d',
                },
                margin: "10px",
                borderRadius: "50px",
            }} onClick={() => handleClick(inputValue)}>Set Username</Button>
        </div >
    );
};
