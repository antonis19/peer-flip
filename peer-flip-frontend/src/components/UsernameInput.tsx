import { TextField, Button } from '@mui/material';
import React, { useState } from 'react';

interface UsernameInputProps {
    setUsername: (username: string) => void;
}

export const UsernameInput: React.FC<UsernameInputProps> = ({ setUsername }) => {
    const [inputValue, setInputValue] = useState('');



    return (
        <div>
            <TextField
                id="username-input"
                label="Username"
                sx={{
                    width: '200px',
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
                backgroundColor: '#3f51b5',
                color: '#fff',
                '&:hover': {
                    backgroundColor: '#303f9f',
                },
                margin: "8px",
            }} onClick={() => setUsername(inputValue)}>Set Username</Button>
        </div >
    );
};
