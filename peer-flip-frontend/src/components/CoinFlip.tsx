// CoinFlip.tsx
import React, { useContext, useEffect, useState } from "react";
import RoomClient from '../Client';
import { CoinFlipStage, CoinFlipState } from "../CoinFlipSession";
import RoomClientContext from '../contexts/RoomClientContext';
import Coin from './Coin';
import { Button } from '@mui/material';
import styles from '../styles/CoinFlip.module.css';
import { RoomContext } from "../contexts/RoomContext";
import Box from '@mui/system/Box';
import { ErrorContext } from "../contexts/ErrorContext";
import { CoinFlipStateContext } from '../contexts/CoinFlipStateContext';

const CoinFlip: React.FC = () => {
    const roomClient = useContext(RoomClientContext) as RoomClient;
    const [statusMessage, setStatusMessage] = useState("");
    const [flipOutcome, setFlipOutcome] = useState<'HEADS' | 'TAILS' | undefined>(undefined);
    const [isFlipping, setIsFlipping] = useState(false);

    const roomContext = useContext(RoomContext);
    const errorContext = useContext(ErrorContext);
    const coinFlipContext = useContext(CoinFlipStateContext);

    if (!coinFlipContext) {
        throw new Error("CoinFlipStateContext is undefined.");
    }

    if (!roomContext) {
        throw new Error('RoomContext is undefined.');
    }

    if (!errorContext) {
        throw new Error('ErrorContext is undefined.')
    }

    const { joined } = roomContext;
    const { setErrorMessage } = errorContext;
    const { setCoinFlipState } = coinFlipContext;

    const getStatusMessageFromState = (state: CoinFlipState) => {
        const stage = state.stage;
        switch (stage) {
            case CoinFlipStage.IDLE:
                return "";
            case CoinFlipStage.STARTED:
                return "Waiting for other peers to flip...";
            case CoinFlipStage.COMMITMENT_SENT:
                return "Flipping in progress...";
            case CoinFlipStage.REVEAL_SENT:
                return "Revealing values...";
            case CoinFlipStage.FINISHED:
                return `Flip result: ${state.flipOutcome!.result}`;
            case CoinFlipStage.ABORTED:
                setErrorMessage(`Coin flip aborted due to an error: ${state.flipOutcome!.error}`);
                return "";
            default:
                return "Unknown state.";
        }
    }

    useEffect(() => {
        if (roomClient) {
            roomClient.setOnCoinFlipStateChanged((state: CoinFlipState) => {
                const { flipOutcome } = state;
                setIsFlipping(roomClient.coinFlipSession.flipInProgress());
                console.log(">>>>>>> STAGE = " + state.stage);
                console.log(">>>>>>> RESULT = ", flipOutcome?.result);
                setFlipOutcome(flipOutcome?.result);
                setStatusMessage(getStatusMessageFromState(state));
                // needed because the React's use effect in the CoinFlipStateContext does not listen to in-place modifications of the state object
                const updatedState = { ...state };
                setCoinFlipState(updatedState);
            });
        }
    }, [roomClient,]);

    const handleClick = () => {
        setErrorMessage('');
        setIsFlipping(true);
        roomClient.flip();
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',  // Add space between items
            }}
        >
            <Coin isFlipping={isFlipping} flipOutcome={flipOutcome} />
            <h3>{statusMessage}</h3>
            {joined &&
                <Button
                    sx={{ borderRadius: '50px', width: '100px', height: '40px', fontWeight: 'bold' }}
                    variant="contained"
                    className={styles.button}
                    onClick={handleClick}
                >
                    FLIP
                </Button>
            }
        </Box>
    );

};

export default CoinFlip;
