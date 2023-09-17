import { Box, Typography, useMediaQuery } from '@mui/material';
import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import RoomClient from '../Client';
import { CoinFlipStage, CoinFlipState } from '../CoinFlipSession';
import RoomClientContext from '../contexts/RoomClientContext';
import { RoomContext } from '../contexts/RoomContext';
import { ErrorContext } from '../contexts/ErrorContext';
import { CoinFlipStateContext } from '../contexts/CoinFlipStateContext';
import ErrorAlert from './ErrorAlert';
import CoinFlip from './CoinFlip';
import { UsernameInput } from './UsernameInput';
import Room from './Room';
import { CreateRoom } from './CreateRoom';
import ExplanationAccordion from './ExplanationAccordion';


export function MainLayout() {
    const [username, setUsername] = useState('');
    const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
    const [client, setClient] = useState<RoomClient | null>(null);
    const [clientCreated, setClientCreated] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [coinFlipState, setCoinFlipState] = useState<CoinFlipState | null>(null);
    const [joining, setJoining] = useState<boolean>(false);
    const [joined, setJoined] = useState<boolean>(false);
  
    const SERVER_URL = 'wss://shade-knowledgeable-elderberry.glitch.me/';
  
    const isMobile = useMediaQuery('(max-width: 600px)');


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
  


    return  (
    <RoomClientContext.Provider value={client}>
        <RoomContext.Provider value={{ joining, setJoining, joined, setJoined }}>
          <ErrorContext.Provider value={{ errorMessage, setErrorMessage }}>
            <CoinFlipStateContext.Provider value={{ coinFlipState, setCoinFlipState }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#7FFFD4' }}>
                <Typography variant="h4" align="center" gutterBottom>
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
                        <Routes>
                            <Route path="/:roomId" element={<Room username={username} connectedPeers={connectedPeers} />} />
                            <Route path="/" element={<CreateRoom username={username} />} />
                        </Routes>
                        </>
                      )}
                    </Box>
                  </Box>
                </Box>
                {
                  client && coinFlipState && [CoinFlipStage.FINISHED, CoinFlipStage.ABORTED].includes(coinFlipState.stage) &&
                  <Box sx={{
                    ...commonStyles,
                    margin: '1rem',
                    padding: '2rem',
                    width: '100%',  // Takes full width on small screens
                    maxWidth: isMobile ? '90%' : '70%',  // Doesn't exceed 70% width on larger screens, 100% on small screens
                    boxSizing: 'border-box', // Include padding and border in element's total width and height
                  }}>
                    <ExplanationAccordion currentUser={username} />
                  </Box>
                }
              </Box>
            </CoinFlipStateContext.Provider>
          </ErrorContext.Provider>
        </RoomContext.Provider>
      </RoomClientContext.Provider>
      );
}