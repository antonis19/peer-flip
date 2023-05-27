import React from 'react';
import { Alert } from '@mui/material';

interface ErrorAlertProps {
    message: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => {
    if (!message) {
        return null;
    }

    return <Alert severity="error">{message}</Alert>;
};

export default ErrorAlert;
