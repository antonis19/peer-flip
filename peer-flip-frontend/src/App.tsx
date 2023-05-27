// src/App.tsx
import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Container from '@mui/material/Container';
import { Typography } from '@mui/material';
import { UsernameInput } from './components/UsernameInput';
import RoomClient from './Client';
import RoomClientContext from './contexts/RoomClientContext';
import { Home } from './components/Home';
import Room from './components/Room';
import { ErrorContext } from './contexts/ErrorContext';
import ErrorAlert from './components/ErrorAlert';

function App() {
  const [username, setUsername] = useState('');
  const [roomName, setRoomName] = useState('');
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
  const [client, setClient] = useState<RoomClient | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useMemo(() => {
    if (username) {
      console.log("CREATING NEW CLIENT");
      const newClient = new RoomClient('ws://localhost:9090', {
        onError: (message: string) => {
          console.log(`Error: ${message}`);
          setErrorMessage(message);
        },
      }, username);
      newClient.setOnPeersUpdatedCallback((peers: string[]) => {
        setConnectedPeers(peers);
      });
      setClient(newClient);
    }
  }, [username]);



  return (
    <RoomClientContext.Provider value={client}>
      <ErrorContext.Provider value={{ errorMessage, setErrorMessage }}>
        <Container maxWidth="sm">
          <Typography variant="h3" align="center" gutterBottom>
            {username ? `Welcome, ${username}` : 'P2P Coin Flip'}
          </Typography>
          {!username && <UsernameInput setUsername={setUsername} />}
          <Router>
            <Routes>
              {username && <Route path="/:roomId" element={<Room username={username} connectedPeers={connectedPeers} />} />}
              {username && <Route path="/" element={<Home username={username} />} />}
            </Routes>
          </Router>
          <ErrorAlert message={errorMessage} />

        </Container>
      </ErrorContext.Provider>
    </RoomClientContext.Provider>
  );
}

// return (
//   <RoomClientContext.Provider value={client}>
//     <Container maxWidth="sm">
//       <Typography variant="h3" align="center" gutterBottom>
//         {username ? `Welcome, ${username}` : 'WebRTC Room Example'}
//       </Typography>
//       {!username && <UsernameInput setUsername={setUsername} />}
//       {username && (
//         <>
//           <RoomActions onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
//           {roomName && <RoomStatus roomName={roomName} connectedPeers={connectedPeers} />}
//         </>
//       )}
//       {client && <CoinFlip />}
//       {errorMessage && (
//         <div style={{ backgroundColor: 'red', color: 'white', padding: '1rem', marginTop: '1rem' }}>
//           {errorMessage}
//         </div>
//       )}

//     </Container>
//   </RoomClientContext.Provider>
// );


export default App;
