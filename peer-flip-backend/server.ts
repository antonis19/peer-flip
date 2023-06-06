import * as WebSocket from 'ws';
const { Server } = WebSocket;

interface Room {
    roomId: string;
    clients: WebSocket[];
    users: string[];
}

const rooms: Room[] = [];

const server = new Server({ port: 9090 });

server.on('connection', (socket: WebSocket) => {
    console.log('Client connected');

    socket.on('message', (message: string) => {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);

        if (data.type === 'createRoom') {
            const roomId = generateRoomId();
            console.log("Generated room with id = " + roomId);
            rooms.push({ roomId, clients: [], users: [] });
            socket.send(JSON.stringify({ type: 'roomCreated', roomId }));
        }

        // ...
        if (data.type === 'joinRoom') {
            console.log("BEFORE:");
            console.log("Rooms = ");
            console.log(rooms);
            console.log("Data = ")
            console.log(data);
            const roomIdx = rooms.findIndex((room) => room.roomId === data.roomId);
            if (roomIdx != -1) {
                const room = rooms[roomIdx];
                if (room.users.includes(data.userId)) {
                    socket.send(JSON.stringify({ type: 'error', message: `User with id ${data.userId} already exists in the room.` }));
                    return;
                } else {
                    console.log("User not found in room");
                }
                room.clients.push(socket);
                room.users.push(data.userId);
                for (let clientSocket of rooms[roomIdx].clients) {
                    clientSocket.send(JSON.stringify({ type: 'roomJoined', roomId: data.roomId, users: room.users }));
                }
            } else {
                socket.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
            }
            console.log("After:");
            console.log("Rooms = ");
            console.log(rooms);
        }

        if (['offer', 'answer', 'newIceCandidate'].includes(data.type)) {
            console.log("GOT SIGNALING MESSAGE: ");
            console.log(data);
            // Forward signaling messages to the appropriate receiver
            forwardSignalingMessage(data.roomId, data.targetUserId, message.toString());
        }
    });
});


function forwardSignalingMessage(roomId: string, targetUserId: string, message: string): void {
    const room = rooms.find((room) => room.roomId === roomId);
    if (!room) {
        console.error('Room not found:', roomId);
        return;
    }

    const receiverIndex = room.users.findIndex((userId) => userId === targetUserId);
    if (receiverIndex === -1) {
        console.error('Receiver not found:', targetUserId);
        return;
    }
    console.log("Trying to forward signaling message to userId= " + room.users[receiverIndex]);
    const receiverSocket = room.clients[receiverIndex];
    if (receiverSocket.readyState === WebSocket.OPEN) {
        console.log("Sending signalling message:");
        console.log(message);
        receiverSocket.send(message);
    }
}


function broadcastMessage(roomId: string, message: string): void {
    const room = rooms.find((room) => room.roomId === roomId);
    if (!room) {
        return;
    }
    const clients = room?.clients;
    if (!clients) return;

    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

function generateRoomId(): string {
    return Math.random().toString(36).substr(2, 9);
}
