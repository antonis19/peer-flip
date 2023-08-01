import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import HomeIcon from '@mui/icons-material/Home';
import GitHubIcon from '@mui/icons-material/GitHub';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const Navbar = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <AppBar position="static" style={{ backgroundColor: 'teal' }}>
            <Toolbar disableGutters>
                <Box display="flex" alignItems="center">
                    <Button color="inherit" href="/" style={{ height: '64px', minHeight: '64px' }}>
                        <HomeIcon />
                    </Button>
                </Box>
                <Typography variant={isMobile ? "subtitle1" : "h6"} component="div" sx={{ flexGrow: 1 }}>
                    PeerFlip: A P2P Coin Flip Protocol
                </Typography>
                <Button color="inherit" href="/how-it-works" style={{ height: '64px', minHeight: '64px' }}>How It Works</Button>
                <Button color="inherit" href="https://github.com/antonis19/peer-flip" target="_blank" style={{ height: '64px', minHeight: '64px', width: '8px' }}>
                    <GitHubIcon />
                </Button>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;
