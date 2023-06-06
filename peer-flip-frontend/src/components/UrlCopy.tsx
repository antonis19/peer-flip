import React, { useRef, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';
import Tooltip from '@mui/material/Tooltip';
import styles from '../styles/UrlCopy.module.css'
import { Box } from '@mui/system';
import { Typography } from '@mui/material';

const UrlCopy: React.FC = () => {
    const [copySuccess, setCopySuccess] = useState<string>('');
    const url = window.location.href; // This is the current URL, change if needed
    const textAreaRef = useRef<HTMLInputElement>(null);

    const copyToClipboard = (e: React.MouseEvent) => {
        textAreaRef.current!.select(); // Select the text
        document.execCommand('copy'); // Copy it to the clipboard
        (e.currentTarget as HTMLElement).focus(); // Place the focus back on the button
        setCopySuccess('Copied!');
    };


    return (
        <div>
            <h4 style={{ marginBottom: '1px' }}>Room URL:  </h4>
            <Box
                display="flex" // Flexbox is used
                flexDirection="row"
                alignItems="center"
                gap="2px" // Adjust this for the desired gap size
                className={styles.urlcopyDiv}
            >
                <TextField
                    className={styles.urlcopy}
                    inputRef={textAreaRef}
                    value={url}
                    fullWidth
                    variant="outlined"
                    InputProps={{
                        style: {
                            paddingTop: '0px',
                            paddingBottom: '0px',
                            fontSize: '14px', //reduce font size if necessary
                        },
                    }}
                />
                <Tooltip title={copySuccess} placement="top">
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: "#00612d",
                            borderRadius: '50px',
                            width: '100px',
                            height: '40px',
                            fontWeight: 'bold',
                            '&:hover': {
                                backgroundColor: "#00612d", // same as normal background color
                            },
                        }}
                        onClick={copyToClipboard}
                        startIcon={<FileCopyOutlinedIcon />}
                    >
                        Copy
                    </Button>
                </Tooltip>
            </Box>
        </div>
    );

};

export default UrlCopy;
