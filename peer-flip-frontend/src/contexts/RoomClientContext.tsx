import { createContext } from 'react';
import RoomClient from '../Client';

const RoomClientContext = createContext<RoomClient | null>(null);
export default RoomClientContext;
