import React, { useState } from 'react';
import styles from '../styles/Coin.module.css';

type CoinProps = {
    isFlipping: boolean;
    flipOutcome: 'HEADS' | 'TAILS' | undefined;
}

const Coin: React.FC<CoinProps> = ({ isFlipping, flipOutcome }) => {
    let coinClasses = [styles.coin];
    let headsClasses = [styles.face, styles.heads];
    let tailsClasses = [styles.face, styles.tails];

    if (isFlipping) {
        headsClasses.push(styles.flippingHeads);
        tailsClasses.push(styles.flippingTails);
    } else if (flipOutcome === 'HEADS') {
        headsClasses.push(styles.landHeads);
    } else if (flipOutcome === 'TAILS') {
        tailsClasses.push(styles.landTails);
    }

    function isHeads() {
        return flipOutcome != undefined && flipOutcome == 'HEADS';
    }

    function isTails() {
        return flipOutcome != undefined && flipOutcome == 'TAILS';
    }

    function isUndefined() {
        return flipOutcome == undefined;
    }

    return (
        <div className={coinClasses.join(' ')}>
            {(isFlipping || isHeads() || isUndefined()) && <div className={headsClasses.join(' ')}></div>}
            {(isFlipping || isTails()) && <div className={tailsClasses.join(' ')}></div>}
        </div>
    );
};

export default Coin;
