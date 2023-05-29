import React from 'react';
import '../styles/Coin.module.css';

interface CoinProps {
    face: string;
}

const Coin: React.FC<CoinProps> = ({ face }) => {
    return (
        <div className="coin">
            <div className="face head">{face === 'heads' ? 'H' : ''}</div>
            <div className="face tail">{face === 'tails' ? 'T' : ''}</div>
        </div>
    );
};

export default Coin;
