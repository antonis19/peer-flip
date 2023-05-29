import React, { useRef, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';
import Tooltip from '@mui/material/Tooltip';
import styles from '../styles/UrlCopy.module.css'

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
        <div className={styles.urlcopyDiv}>
            <TextField className={styles.urlcopy}
                inputRef={textAreaRef}
                value={url}
                fullWidth
                variant="outlined"
                InputProps={{
                    style: {
                        paddingTop: '0px',
                        paddingBottom: '0px',
                        fontSize: '14px', //reduce font size if necessary
                    }
                }}
            />
            <Tooltip title={copySuccess} placement="top">
                <Button variant="contained" onClick={copyToClipboard} startIcon={<FileCopyOutlinedIcon />}>
                    Copy
                </Button>
            </Tooltip>
        </div>
    );
};

export default UrlCopy;
