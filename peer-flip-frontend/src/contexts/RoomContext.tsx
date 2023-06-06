// RoomContext.ts
import React from "react";

interface RoomContextInterface {
    joining: boolean;
    setJoining: React.Dispatch<React.SetStateAction<boolean>>;
    joined: boolean;
    setJoined: React.Dispatch<React.SetStateAction<boolean>>;
}

export const RoomContext = React.createContext<RoomContextInterface | null>(null);
