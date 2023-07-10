"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebSocket = require("ws");
var Server = WebSocket.Server;
var rooms = [];
var PORT = process.env.PORT || 9090;
var server = new Server({ port: Number(PORT) });
console.log("Started server on port " + PORT);
server.on('connection', function (socket) {
    console.log('Client connected');
    socket.on('close', function () {
        console.log('Client disconnected');
        // Find the room and user associated with this socket
        for (var _i = 0, rooms_1 = rooms; _i < rooms_1.length; _i++) {
            var room = rooms_1[_i];
            var userIndex = room.clients.findIndex(function (client) { return client === socket; });
            if (userIndex !== -1) {
                // Remove the user from the room's clients and users arrays
                room.clients.splice(userIndex, 1);
                var username = room.users[userIndex];
                room.users.splice(userIndex, 1);
                // Notify other users in the room about the disconnection
                for (var _a = 0, _b = room.clients; _a < _b.length; _a++) {
                    var client = _b[_a];
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'userDisconnected', userId: username, users: room.users }));
                    }
                }
                break;
            }
        }
    });
    socket.on('message', function (message) {
        var data = JSON.parse(message.toString());
        console.log('Received message:', data);
        if (data.type === 'createRoom') {
            var roomId = generateRoomId();
            console.log("Generated room with id = " + roomId);
            rooms.push({ roomId: roomId, clients: [], users: [] });
            socket.send(JSON.stringify({ type: 'roomCreated', roomId: roomId }));
        }
        if (data.type === 'joinRoom') {
            console.log("BEFORE:");
            console.log("Rooms = ");
            console.log(rooms);
            console.log("Data = ");
            console.log(data);
            var roomIdx = rooms.findIndex(function (room) { return room.roomId === data.roomId; });
            if (roomIdx != -1) {
                var room = rooms[roomIdx];
                if (room.users.includes(data.userId)) {
                    socket.send(JSON.stringify({ type: 'error', message: "User with id ".concat(data.userId, " already exists in the room.") }));
                    return;
                }
                else {
                    console.log("User not found in room");
                }
                room.clients.push(socket);
                room.users.push(data.userId);
                for (var _i = 0, _a = rooms[roomIdx].clients; _i < _a.length; _i++) {
                    var clientSocket = _a[_i];
                    clientSocket.send(JSON.stringify({ type: 'roomJoined', roomId: data.roomId, users: room.users }));
                }
            }
            else {
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
function forwardSignalingMessage(roomId, targetUserId, message) {
    var room = rooms.find(function (room) { return room.roomId === roomId; });
    if (!room) {
        console.error('Room not found:', roomId);
        return;
    }
    var receiverIndex = room.users.findIndex(function (userId) { return userId === targetUserId; });
    if (receiverIndex === -1) {
        console.error('Receiver not found:', targetUserId);
        return;
    }
    console.log("Trying to forward signaling message to userId= " + room.users[receiverIndex]);
    var receiverSocket = room.clients[receiverIndex];
    if (receiverSocket.readyState === WebSocket.OPEN) {
        console.log("Sending signalling message:");
        console.log(message);
        receiverSocket.send(message);
    }
}
function generateRoomId() {
    return Math.random().toString(36).substr(2, 9);
}
