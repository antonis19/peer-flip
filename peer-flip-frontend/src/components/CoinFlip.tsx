import React, { useContext, useEffect, useState } from "react";
import RoomClient from '../Client';
import { CoinFlipStage, CoinFlipState } from "../CoinFlipSession";
import RoomClientContext from '../contexts/RoomClientContext';
import { Box, TextField, Button } from '@mui/material';
import styles from '../styles/CoinFlip.module.css';


const CoinFlip: React.FC = () => {
    const roomClient = useContext(RoomClientContext) as RoomClient;


    let [statusMessage, setStatusMessage] = useState("");
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
                return `Flip result: ${JSON.stringify(state.flipOutcome)}`;
            case CoinFlipStage.ABORTED:
                return `Coin flip aborted due to an error: ${JSON.stringify(state.flipOutcome)}`;
            default:
                return "Unknown state.";
        }
    }

    useEffect(() => {
        if (roomClient) {
            console.log("REACT : CALLING USE EFFECT");
            roomClient.setOnCoinFlipStateChanged((state: CoinFlipState) => {
                setStatusMessage(getStatusMessageFromState(state));
            });
        }
    }, [roomClient]);

    const handleClick = () => {
        roomClient.flip();
    };

    return (
        <div>
            <Button variant="contained" className={styles.button} onClick={handleClick}>FLIP COIN</Button>
            <div>{statusMessage}</div>
        </div>
    );
};

export default CoinFlip;
