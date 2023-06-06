// CoinFlip.tsx
import React, { useContext, useEffect, useState } from "react";
import RoomClient from '../Client';
import { CoinFlipStage, CoinFlipState } from "../CoinFlipSession";
import RoomClientContext from '../contexts/RoomClientContext';
import Coin from './Coin';
import { Button } from '@mui/material';
import styles from '../styles/CoinFlip.module.css';
import { RoomContext } from "../contexts/RoomContext";

const CoinFlip: React.FC = () => {
    const roomClient = useContext(RoomClientContext) as RoomClient;
    const [statusMessage, setStatusMessage] = useState("");
    const [flipOutcome, setFlipOutcome] = useState<'HEADS' | 'TAILS' | undefined>(undefined);
    const [isFlipping, setIsFlipping] = useState(false);

    const roomContext = useContext(RoomContext);

    if (!roomContext) {
        throw new Error('RoomContext is undefined');
    }

    const { joined } = roomContext;

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
                return `Coin flip aborted due to an error: ${state.flipOutcome!.error}`;
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
            });
        }
    }, [roomClient]);

    const handleClick = () => {
        setIsFlipping(true);
        roomClient.flip();
    };

    return (
        <div>
            <h3>{statusMessage}</h3>
            <Coin isFlipping={isFlipping} flipOutcome={flipOutcome} />
            {joined && <Button variant="contained" className={styles.button} onClick={handleClick}>FLIP COIN</Button>}
        </div>
    );
};

export default CoinFlip;
