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
import Coin from './components/Coin';
import CoinFlip from './components/CoinFlip';
import { RoomContext } from './contexts/RoomContext';

function App() {
  const [username, setUsername] = useState('');
  const [roomName, setRoomName] = useState('');
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
  const [client, setClient] = useState<RoomClient | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [joining, setJoining] = useState<boolean>(false);
  const [joined, setJoined] = useState<boolean>(false);


  useEffect(() => {
    if (username) {
      console.log(`CREATING NEW CLIENT for ${username}`);
      const newClient = new RoomClient('ws://localhost:9090', {
        onError: (message: string) => {
          console.log(`Error: ${message}`);
          setErrorMessage(message);
          if (errorMessage.includes("already exists")) {
            console.log("Resetting username to empty string ");
            console.log(`Setting CLIENT for ${username} to null`);
            setUsername('');
            client?.teardown();
            setClient(null);
            setJoined(false);
            setJoining(false);
          }
        },
      }, username);
      newClient.setOnPeersUpdatedCallback((peers: string[]) => {
        setConnectedPeers(peers);
      });
      setClient(newClient);
    }
  }, [username]);

  const commonStyles = {
    bgcolor: 'white',
    borderRadius: '1rem',
    padding: '2rem',
  };

  return (
    <RoomClientContext.Provider value={client}>
      <RoomContext.Provider value={{ joining, setJoining, joined, setJoined }}>
        <ErrorContext.Provider value={{ errorMessage, setErrorMessage }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', bgcolor: '#7FFFD4' }}>
            <Typography variant="h3" align="center" gutterBottom>
              {username ? `Welcome, ${username}` : 'P2P Coin Flip'}
            </Typography>
            <ErrorAlert message={errorMessage} />
            <Box sx={{ display: 'flex', width: '80%', height: '75vh', marginTop: '2rem', gap: '1rem' }}>
              <Box sx={{
                ...commonStyles,
                height: '75vh',
                overflow: 'auto',
                flexGrow: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <CoinFlip />
              </Box>
              <Box sx={{
                ...commonStyles,
                flexGrow: 1,
              }}>
                {!username && <UsernameInput setUsername={setUsername} />}
                <Router>
                  <Routes>
                    {username && <Route path="/:roomId" element={<Room username={username} connectedPeers={connectedPeers} />} />}
                    {username && <Route path="/" element={<Home username={username} />} />}
                  </Routes>
                </Router>
              </Box>
            </Box>
          </Box>
        </ErrorContext.Provider>
      </RoomContext.Provider>
    </RoomClientContext.Provider>
  );
}

export default App;