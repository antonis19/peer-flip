import { Dispatch, SetStateAction, createContext } from 'react';
import { CoinFlipState } from '../CoinFlipSession';

interface CoinFlipStateContextInterface {
    coinFlipState: CoinFlipState | null;
    setCoinFlipState: Dispatch<SetStateAction<CoinFlipState | null>>;
}


export const CoinFlipStateContext = createContext<CoinFlipStateContextInterface | null>(null);