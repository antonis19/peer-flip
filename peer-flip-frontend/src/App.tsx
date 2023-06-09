// src/App.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Typography, Container, Box } from '@mui/material';
import { UsernameInput } from './components/UsernameInput';
import RoomClient from './Client';
import RoomClientContext from './contexts/RoomClientContext';
import { Home } from './components/Home';
import Room from './components/Room';
import { ErrorContext } from './contexts/ErrorContext';
import ErrorAlert from './components/ErrorAlert';
import CoinFlip from './components/CoinFlip';
import { RoomContext } from './contexts/RoomContext';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';


function App() {
  const [username, setUsername] = useState('');
  const [roomName, setRoomName] = useState('');
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
  const [client, setClient] = useState<RoomClient | null>(null);
  const [clientCreated, setClientCreated] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [joining, setJoining] = useState<boolean>(false);
  const [joined, setJoined] = useState<boolean>(false);

  const SERVER_URL = 'wss://shade-knowledgeable-elderberry.glitch.me/';

  const isMobile = useMediaQuery('(max-width: 600px)');

  const theme = createTheme({
    typography: {
      fontFamily: 'monospace, monaco',
    },
  });


  useEffect(() => {
    if (username && !clientCreated) {
      console.log(`CREATING NEW CLIENT for ${username}`);
      const newClient = new RoomClient(SERVER_URL, {
        onError: (message: string) => {
          console.log(`Error: ${message}`);
          setErrorMessage(message);
          if (message.includes("already exists")) {
            console.log("Resetting username to empty string ");
            console.log(`Setting CLIENT for ${username} to null`);
            setUsername('');
            setClient(null);
            setClientCreated(false);
            setJoined(false);
            setJoining(false);
            client?.teardown();
          }
        },
      }, username);
      newClient.setOnPeersUpdatedCallback((peers: string[]) => {
        setConnectedPeers(peers);
      });
      setClient(newClient);
      setClientCreated(true);
    }
  }, [username, clientCreated]);

  const commonStyles = {
    bgcolor: 'white',
    borderRadius: '1rem',
  };

  return (
    <ThemeProvider theme={theme}>
      <RoomClientContext.Provider value={client}>
        <RoomContext.Provider value={{ joining, setJoining, joined, setJoined }}>
          <ErrorContext.Provider value={{ errorMessage, setErrorMessage }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#7FFFD4' }}>
              <Typography variant="h3" align="center" gutterBottom>
                P2P Coin Flip
              </Typography>
              <ErrorAlert message={errorMessage} />
              <Box sx={{
                display: 'flex', width: '90vw', height: '80%',
                gap: '1rem',
                flexDirection: isMobile ? 'column' : 'row'
              }}>
                <Box sx={{
                  ...commonStyles,
                  padding: '2rem',
                  flex: isMobile ? 'initial' : 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                  <CoinFlip />
                </Box>
                <Box sx={{
                  ...commonStyles,
                  paddingTop: "0px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                  flex: isMobile ? 'initial' : 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                  {!username && (
                    <div style={{ marginTop: '2rem' }}>
                      <UsernameInput setUsername={setUsername} />
                    </div>
                  )}
                  <Box
                    sx={{
                      bgcolor: "white",
                      paddingTop: "0%",
                      paddingLeft: "1%",
                      paddingRight: "1%",
                      justifyContent: "center",
                      alignItems: "left",
                      flexDirection: "column", // Add this line to stack the components vertically
                    }}
                  >
                    {username && (
                      <>
                        <h2>Your username: <span style={{ color: '#00612d' }}>{username}</span></h2>
                        <Router>
                          <Routes>
                            {username && <Route path="/:roomId" element={<Room username={username} connectedPeers={connectedPeers} />} />}
                            {username && <Route path="/" element={<Home username={username} />} />}
                          </Routes>
                        </Router>
                      </>
                    )}
                  </Box>

                </Box>
              </Box>
            </Box>
          </ErrorContext.Provider>
        </RoomContext.Provider>
      </RoomClientContext.Provider>
    </ThemeProvider>
  );
}

export default App;