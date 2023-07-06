import { CoinFlipSession, CoinFlipState, CoinFlipStage } from "./CoinFlipSession";
import { generateCommitment } from './utils';

type RoomClientCallbacks = {
    onRoomCreated?: (roomId: string) => void;
    onRoomJoined?: (roomId: string, userId: string) => void;
    onError?: (message: string) => void;
    onCoinFlipStateChanged?: (state: CoinFlipState) => void;
};


export default class RoomClient {
    public socket: WebSocket;
    public callbacks: RoomClientCallbacks;
    private roomId: string;
    private userId: string;
    private peerConnections: Map<string, RTCPeerConnection>;
    private dataChannels: Map<string, RTCDataChannel>;
    private onPeersUpdatedCallback!: (peers: string[]) => void;
    public coinFlipSession: CoinFlipSession;
    private peerConnectionListeners: Map<RTCPeerConnection, any>;
    private dataChannelListeners: Map<RTCDataChannel, any>;



    constructor(url: string, callbacks: RoomClientCallbacks, userId: string) {
        console.log("Client starting for user " + userId);
        this.socket = new WebSocket(url);
        this.userId = userId;
        this.roomId = "";
        this.callbacks = callbacks;
        this.peerConnections = new Map();
        this.peerConnectionListeners = new Map();
        this.dataChannels = new Map();
        this.dataChannelListeners = new Map();
        this.addListeners();
        this.coinFlipSession = new CoinFlipSession();
    }

    public teardown() {
        this.socket.removeEventListener('message', this.socketListener);
        this.socket.close();
        this.teardownPeerConnections();
        this.teardownDataChannels();
    }

    public setOnPeersUpdatedCallback(callback: (peers: string[]) => void) {
        this.onPeersUpdatedCallback = callback;
    }

    private initiateWebRTCConnection(users: string[]): void {
        console.log("Initiating WebRTC connection... users = " + users);
        // Create a new RTCPeerConnection for each existing client in the room
        for (const userId of users) {
            if (userId !== this.userId) {
                console.log("Initatiating connection to " + userId);
                const peerConnection = this.createPeerConnection(userId);
                this.peerConnections.set(userId, peerConnection);
                this.onPeersUpdatedCallback(this.getPeerNames());
            }
        }
        console.log("Exiting initateWebRTCConnection");
    }

    private createPeerConnection(targetUserId: string): RTCPeerConnection {
        const peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
            {
                urls: 'turn:numb.viagenie.ca',
                credential: 'muazkh',
                username: 'webrtc@live.com'
            },
            {
                urls: 'turn:turn02.hubl.in?transport=tcp',
            },
            {
                urls: 'turn:192.158.29.39:3478?transport=tcp',
                credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                username: '28224511:1379330808'
            },
            {
                urls: 'turn:turn.bistri.com:80',
                credential: 'homeo',
                username: 'homeo'
            },
            {
                urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
                credential: 'webrtc',
                username: 'webrtc'
            }],
        });

        // Define the listener functions
        const negotiationNeededListener = async () => {
            console.log("TRIGGERED onnegotiationneeded");
            await this.initiateOffer(targetUserId);
        };

        const iceCandidateListener = async (event: RTCPeerConnectionIceEvent) => {
            console.log("TRIGGERED onicecandidate");
            if (event.candidate) {
                const candidate = event.candidate.toJSON();
                console.log("Candidate = ");
                console.log(candidate);
                await this.sendSignalingMessage(targetUserId, { type: 'newIceCandidate', candidate: event.candidate.toJSON() });
            }
        };

        const iceGatheringStateChangeListener = async () => {
            console.log("TRIGGERED onicegatheringstatechange");
            console.log(`ICE gathering state changed: ${peerConnection.iceGatheringState}`);
        };

        const connectionStateChangeListener = () => {
            console.log("TRIGGERED onconnectionstatechange");
            console.log("Connection established to " + targetUserId);
        };

        // Now add the event listeners using the defined functions
        peerConnection.addEventListener('negotiationneeded', negotiationNeededListener);
        peerConnection.addEventListener('icecandidate', iceCandidateListener);
        peerConnection.addEventListener('icegatheringstatechange', iceGatheringStateChangeListener);
        peerConnection.addEventListener('connectionstatechange', connectionStateChangeListener);

        // Save the event listeners somewhere accessible for later removal
        this.peerConnectionListeners.set(peerConnection, {
            negotiationNeededListener,
            iceCandidateListener,
            iceGatheringStateChangeListener,
            connectionStateChangeListener
        });

        // If the current user's ID is lower than the target user's ID, create the data channel
        if (this.userId < targetUserId) {
            console.log(">Initiating data channel");
            const dataChannel = peerConnection.createDataChannel('dataChannel');

            const openListener = () => {
                console.log('Data channel open');
            };
            const messageListener = (event: any) => {
                console.log(`Received message from peer ${targetUserId}:`, event.data);
                const parsedData = JSON.parse(event.data);
                this.handleDataChannelMessage(targetUserId, parsedData);
            };

            dataChannel.addEventListener('open', openListener);
            dataChannel.addEventListener('message', messageListener);

            this.dataChannelListeners.set(dataChannel, {
                openListener,
                messageListener
            });

            this.dataChannels.set(targetUserId, dataChannel);
        } else {
            console.log(">Waiting for datachannel");
            // If the current user's ID is greater, wait for the ondatachannel event
            peerConnection.ondatachannel = (event) => {
                const dataChannel = event.channel;

                const openListener = () => {
                    console.log('Data channel open');
                };
                const messageListener = (event: any) => {
                    console.log(`Received message from peer ${targetUserId}:`, event.data);
                    const parsedData = JSON.parse(event.data);
                    this.handleDataChannelMessage(targetUserId, parsedData);
                };

                dataChannel.addEventListener('open', openListener);
                dataChannel.addEventListener('message', messageListener);

                this.dataChannelListeners.set(dataChannel, {
                    openListener,
                    messageListener
                });

                this.dataChannels.set(targetUserId, dataChannel);
            };
        }
        return peerConnection;
    }

    private teardownPeerConnections() {
        for (let [userId, peerConnection] of this.peerConnections) {
            this.removePeerConnectionListeners(peerConnection);
            this.peerConnections.delete(userId);
        }
    }

    private removePeerConnectionListeners(peerConnection: RTCPeerConnection): void {
        const listeners = this.peerConnectionListeners.get(peerConnection);
        if (!listeners) {
            return;
        }

        peerConnection.removeEventListener('negotiationneeded', listeners.negotiationNeededListener);
        peerConnection.removeEventListener('icecandidate', listeners.iceCandidateListener);
        peerConnection.removeEventListener('icegatheringstatechange', listeners.iceGatheringStateChangeListener);
        peerConnection.removeEventListener('connectionstatechange', listeners.connectionStateChangeListener);

        this.peerConnectionListeners.delete(peerConnection);
    }

    private teardownDataChannels() {
        for (const dataChannel of this.dataChannelListeners.keys()) {
            this.removeDataChannelListeners(dataChannel);
            this.dataChannelListeners.delete(dataChannel);
        }
    }

    private removeDataChannelListeners(dataChannel: RTCDataChannel): void {
        const listeners = this.dataChannelListeners.get(dataChannel);
        if (!listeners) {
            return;
        }

        dataChannel.removeEventListener('open', listeners.openListener);
        dataChannel.removeEventListener('message', listeners.messageListener);

        this.dataChannelListeners.delete(dataChannel);
    }





    private async initiateOffer(targetUserId: string): Promise<void> {
        const peerConnection = this.peerConnections.get(targetUserId);
        if (!peerConnection) {
            console.error(`PeerConnection not found for user ${targetUserId}`);
            return;
        }

        try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            this.sendSignalingMessage(targetUserId, { type: 'offer', offer });
        } catch (error) {
            console.error('Failed to create and send offer:', error);
        }
    }


    private async sendSignalingMessage(targetUserId: string, message: any): Promise<void> {
        console.log("Sending signaling meesage to " + targetUserId + " ,message: ");
        console.log(message);
        this.socket.send(JSON.stringify({ ...message, targetUserId, senderId: this.userId, roomId: this.roomId }));
    }


    private async handleSignalingMessage(data: any): Promise<void> {
        console.log("HANDLINGSIGNALINGMESSAGE data: ");
        console.log(data);
        let peerConnection = this.peerConnections.get(data.senderId);
        if (!peerConnection) {
            console.log("peerConnection is undefined, creating a new one");
            peerConnection = await this.createPeerConnection(data.senderId);
            this.peerConnections.set(data.senderId, peerConnection);
            this.onPeersUpdatedCallback(this.getPeerNames());
        }

        if (data.type === 'offer') {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            this.sendSignalingMessage(data.senderId, { type: 'answer', answer });
        }

        if (data.type === 'answer') {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        }

        if (data.type === 'newIceCandidate') {
            try {
                await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (err) {
                console.error('Error adding received ice candidate', err);
            }
        }
    }

    private socketListener = async (event: any) => {
        const data = JSON.parse(event.data);
        console.log(data);

        // Call handleSignalingMessage for signaling messages
        if (['offer', 'answer', 'newIceCandidate'].includes(data.type)) {
            await this.handleSignalingMessage(data);
        }


        if (data.type === 'roomCreated' && this.callbacks.onRoomCreated) {
            this.callbacks.onRoomCreated(data.roomId);
        }

        if (data.type === 'roomJoined' && this.callbacks.onRoomJoined) {
            console.log("data = ");
            console.log(data);
            this.roomId = data.roomId;
            console.log(`CLIENT for ${this.userId} got new users`);
            const newUsers = data.users.filter((item: string) => !this.getPeerNames().includes(item));
            this.initiateWebRTCConnection(newUsers);
            for (let newUser of newUsers) {
                this.callbacks.onRoomJoined(data.roomId, newUser);
                if (!this.coinFlipSession.flipInProgress() && newUser !== this.userId) {
                    this.coinFlipSession.addUser(newUser);
                }
            }
        }

        if (data.type === 'error' && this.callbacks.onError) {
            this.callbacks.onError(data.message);
        }
    };

    private addListeners(): void {
        this.socket.addEventListener('message', this.socketListener);
    }


    // Send a message to a specific data channel
    private async sendToDataChannel(targetUserId: string, message: any): Promise<void> {
        const dataChannel = this.dataChannels.get(targetUserId);
        console.log("DATACHANNEL = ", dataChannel);
        if (dataChannel && dataChannel.readyState === 'open') {
            // if (this.userId !== "Charlie") {
            //     console.log("SLEEPING....");
            //     await sleep(2000);
            // }
            console.log(`Sending ${JSON.stringify(message)} to dataChannel for ${targetUserId}`);
            dataChannel.send(JSON.stringify(message));
        } else {
            console.log("NOT SENDING");
        }
    }

    // Broadcast a message to all data channels
    private async broadcastToDataChannels(userIds: string[], message: any): Promise<void> {
        console.log("Starting broadcasting");
        for (const targetUserId of userIds) {
            console.log(`Sending start to ${targetUserId}`);
            console.log("STATE = ");
            console.log(this.coinFlipSession.getCoinFlipState());
            await this.sendToDataChannel(targetUserId, message);
        }
    }

    private async waitForCondition(condition: () => boolean, cancelCondition: () => boolean): Promise<boolean> {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (cancelCondition()) {
                    console.log("CANCEL CONDITION REACHED!");
                    clearInterval(interval);
                    resolve(false);
                }
                if (condition()) {
                    console.log("CONDITION REACHED");
                    clearInterval(interval);
                    resolve(true);
                }
            }, 100);
        });
    }


    public flip() {
        if (this.coinFlipSession.flipInProgress()) {
            return;
        }


        const numConnectedPeers = this.peerConnections.size;
        if (numConnectedPeers <= 0) {
            this.coinFlipSession.setFlipOutcome({ error: "No Connected Peers", result: undefined });
            this.coinFlipSession.updateCoinFlipStage(CoinFlipStage.ABORTED);
            return;
        } else {
            this.coinFlipSession.setOtherUsers(this.getPeerNames());
        }

        if (this.coinFlipSession.flipCompleted()) {
            this.coinFlipSession.startNewSessionWithUsers(this.getPeerNames());
        }

        // Set a new timeout 
        this.coinFlipSession.setCoinFlipTimeout(async () => {
            const errorMsg = `Coin flip timed out due to inactivity!`
            await this.broadcastErrorAndAbort({ type: "error", message: errorMsg });
        });


        const connectedUsers = this.coinFlipSession.getOtherUsers()
        // Broadcast the startCoinFlip message to all connected peers
        this.broadcastToDataChannels(connectedUsers, { type: 'startCoinFlip', users: connectedUsers.concat([this.userId]) });
        this.coinFlipSession.updateCoinFlipStage(CoinFlipStage.STARTED);

    }


    private async handleDataChannelMessage(senderId: string, data: any): Promise<void> {
        console.log(`Data channel message received from ${senderId}:`, data);
        console.log("Data.type = " + data.type);
        console.log(`CoinFlipState = `);
        console.log(this.coinFlipSession.getCoinFlipState());
        if (this.coinFlipSession.flipInProgress() && !this.coinFlipSession.isUserInSession(senderId)) {
            console.warn("WARNING: Received message from user not participating in the current session");
            this.sendToDataChannel(senderId, { type: 'error', message: `User ${senderId} not included in the current coin flip round. Please wait for next round.` });
            return;
        }
        switch (data.type) {
            case 'startCoinFlip':
                console.log("GOT THE COIN FLIP START");
                if (this.coinFlipSession.flipCompleted()) {
                    this.coinFlipSession.startNewSessionWithUsers(this.getPeerNames());
                } else if (![CoinFlipStage.IDLE, CoinFlipStage.STARTED].includes(this.coinFlipSession.getCoinFlipStage())) {
                    const errorMsg = `Unexpected message type 'startCoinFlip' for stage ${this.coinFlipSession.getCoinFlipStage()}`;
                    await this.broadcastErrorAndAbort({ type: "error", message: errorMsg });
                    return;
                }

                this.coinFlipSession.setStartCoinFlipReceived(senderId);
                const myUsers = this.coinFlipSession.getOtherUsers().concat(this.userId).sort();
                const theirUsers = data.users.sort();
                const sameUsersInSession = this.checkSameUsersInSession(myUsers, theirUsers);
                if (!sameUsersInSession) {
                    const errorMsg = `Mismatching set of users our users: ${JSON.stringify(myUsers)}, and users of ${senderId}: ${JSON.stringify(theirUsers)}`;
                    console.error(errorMsg);
                    const error = { type: "error", message: errorMsg };
                    await this.sendToDataChannel(senderId, error);
                    await this.broadcastErrorAndAbort(error);
                    return;
                }

                if (this.coinFlipSession.nCoinFlipStarts() === this.coinFlipSession.getOtherUsers().length) {
                    // Need to have waited for the user to broadcast the startCoinFlip before proceeding further
                    console.log("Waiting CoinFlipStage.STARTED");
                    const conditionReached = await this.waitForCondition(() => this.coinFlipSession.getCoinFlipStage() === CoinFlipStage.STARTED,
                        () => this.coinFlipSession.flipCompleted());
                    console.log("CONDITION REACHED = " + conditionReached);
                    if (conditionReached) {
                        await this.broadcastCommitment();
                    } else { // message is now outdated
                        return;
                    }
                }
                break;
            case 'commitment':
                if (![CoinFlipStage.STARTED, CoinFlipStage.COMMITMENT_SENT].includes(this.coinFlipSession.getCoinFlipStage())) {
                    const errorMsg = `Unexpected message type 'commitment' for stage ${this.coinFlipSession.getCoinFlipStage()}`;
                    await this.broadcastErrorAndAbort({ type: "error", message: errorMsg });
                    return;
                }
                this.coinFlipSession.setCommitmentReceived(senderId, data.commitment);
                if (this.coinFlipSession.nCommitmentsReceived() === this.coinFlipSession.getOtherUsers().length) {
                    console.log("Waiting for CoinFlipStage.COMMITMENT_SENT.");
                    const conditionReached = await this.waitForCondition(() => this.coinFlipSession.getCoinFlipStage() === CoinFlipStage.COMMITMENT_SENT,
                        () => this.coinFlipSession.flipCompleted());
                    if (conditionReached) {
                        await this.broadcastReveal();
                    } else { // message is now outdated
                        return;
                    }
                }
                break;
            case 'reveal':
                if (![CoinFlipStage.COMMITMENT_SENT, CoinFlipStage.REVEAL_SENT].includes(this.coinFlipSession.getCoinFlipStage())) {
                    const errorMsg = `Unexpected message type 'reveal' for stage ${this.coinFlipSession.getCoinFlipStage()}`;
                    await this.broadcastErrorAndAbort({ type: "error", message: errorMsg });
                    return;
                }
                const { v, nonce } = data;
                const isCommitmentMatching = await this.coinFlipSession.doesCommitmentMatch(senderId, v, nonce);
                // verify the commitment matches the (senderId, v, nonce )
                if (isCommitmentMatching) {
                    this.coinFlipSession.setReveals(senderId, v, nonce);

                    if (this.coinFlipSession.nReveals() === this.coinFlipSession.getOtherUsers().length) {
                        const conditionReached = await this.waitForCondition(() => this.coinFlipSession.getCoinFlipStage() === CoinFlipStage.REVEAL_SENT,
                            () => this.coinFlipSession.flipCompleted());
                        if (conditionReached) {
                            this.coinFlipSession.computeOutcome();
                            this.coinFlipSession.updateCoinFlipStage(CoinFlipStage.FINISHED);
                        } else {
                            return;
                        }
                    }
                } else {
                    const actualCommitment = this.coinFlipSession.getCommitmentFor(senderId);
                    const expectedCommitment = await generateCommitment(senderId, v, nonce);
                    const errorMsg = `Commitment value mismatch for ${senderId}. Expected: ${expectedCommitment} , Actual: ${actualCommitment}. Aborting coin flip process.`;
                    this.abort(errorMsg);
                }
                break;
            case 'error':
                const errorMsg = data.message;
                this.abort(errorMsg);
                break;
            default:
                console.warn('Unknown data channel message type:', data.type);
        }
    }




    private async broadcastErrorAndAbort(error: any) {
        await this.broadcastToDataChannels(this.coinFlipSession.getOtherUsers(), error);
        this.abort(error['message']);
    }

    private abort(errorMsg: string) {
        this.coinFlipSession.setFlipOutcome({
            result: undefined,
            error: errorMsg
        });
        this.coinFlipSession.updateCoinFlipStage(CoinFlipStage.ABORTED);
    }

    private async broadcastCommitment() {
        this.coinFlipSession.setRandomValue();
        this.coinFlipSession.setRandomNonce();
        await this.coinFlipSession.setCommitment(this.userId);
        this.broadcastToDataChannels(this.coinFlipSession.getOtherUsers(), { type: 'commitment', commitment: this.coinFlipSession.getCommitment() });
        this.coinFlipSession.updateCoinFlipStage(CoinFlipStage.COMMITMENT_SENT);
    }

    private async broadcastReveal() {
        this.broadcastToDataChannels(this.coinFlipSession.getOtherUsers(), { type: 'reveal', v: this.coinFlipSession.getValue(), nonce: this.coinFlipSession.getNonce() });
        this.coinFlipSession.updateCoinFlipStage(CoinFlipStage.REVEAL_SENT);
    }


    public setOnCoinFlipStateChanged(callback: (state: CoinFlipState) => void): void {
        this.coinFlipSession.setOnCoinFlipStateChanged(callback);
    }


    public checkSameUsersInSession(myUsers: string[], theirUsers: string[]): boolean {
        const arraysAreEqual = myUsers.length === theirUsers.length && myUsers.every((value, index) => value === theirUsers[index]);
        return arraysAreEqual;
    }

    public getPeerNames(): string[] {
        console.log(this.peerConnections);
        const peerNames = Array.from(this.peerConnections.keys()).map(key => key.toString());
        return peerNames;
    }

    // ... (Keep createRoom and joinRoom methods as before)
    createRoom(): void {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type: 'createRoom' }));
        } else {
            this.socket.addEventListener('open', () => {
                this.socket.send(JSON.stringify({ type: 'createRoom' }));
            });
        }
        this.showStatus('Creating room...');
    }

    joinRoom(roomId: string): void {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type: 'joinRoom', roomId, userId: this.userId }));
        } else {
            this.socket.addEventListener('open', () => {
                this.socket.send(JSON.stringify({ type: 'joinRoom', roomId, userId: this.userId }));
            });
        }
    }

    showStatus(status: string): void {
        console.log(status);
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }
}
