// Coin.tsx
import React from 'react';
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
    } else if (flipOutcome) {
        if (flipOutcome === 'HEADS') {
            headsClasses.push(styles.visible);
        } else if (flipOutcome === 'TAILS') {
            tailsClasses.push(styles.visible);
        }
    }

    return (
        <div className={coinClasses.join(' ')}>
            <div className={headsClasses.join(' ')}></div>
            <div className={tailsClasses.join(' ')}></div>
        </div>
    );
};

export default Coin;
