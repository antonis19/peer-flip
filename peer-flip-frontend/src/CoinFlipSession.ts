import { generateCommitment, generateRandomNonce, generateRandomValue } from './flipUtils';

interface FlipResult {
    error: string | undefined;
    result: 'HEADS' | 'TAILS' | undefined;
}

export enum CoinFlipStage {
    IDLE,
    STARTED,
    COMMITMENT_SENT,
    REVEAL_SENT,
    FINISHED,
    ABORTED
};

export interface CoinFlipState {
    stage: CoinFlipStage;
    otherUsers: string[]; // Other users in session
    receivedStartCoinFlip: Map<string, boolean>;
    receivedCommitments: Map<string, string>;
    revealedValues: Map<string, number>;
    revealedNonces: Map<string, number>;
    v: number;
    nonce: number;
    commitment: string;
    flipOutcome: FlipResult | undefined;
};


export class CoinFlipSession {
    private coinFlipState!: CoinFlipState;
    private onCoinFlipStateChanged: ((state: CoinFlipState) => void) | undefined;
    private coinFlipTimeout: ReturnType<typeof setTimeout> | null = null;
    static TIMEOUT_IN_MINUTES = 1;

    constructor() {
        this.resetCoinFlipSession();
        this.onCoinFlipStateChanged = undefined; // undefined for now, will be set later
    }


    private resetCoinFlipSession() {
        if (this.coinFlipTimeout) {
            clearTimeout(this.coinFlipTimeout);
            this.coinFlipTimeout = null;
        }
        this.coinFlipState = this.initialCoinFlipState();
        console.log("RESETING COIN FLIP STATE TO :");
        console.log(this.coinFlipState);
    }

    private initialCoinFlipState() {
        return {
            stage: CoinFlipStage.IDLE,
            otherUsers: [],
            receivedStartCoinFlip: new Map<string, boolean>(),
            receivedCommitments: new Map<string, string>(),
            revealedValues: new Map<string, number>(),
            revealedNonces: new Map<string, number>(),
            v: -1,
            nonce: -1,
            commitment: '',
            flipOutcome: undefined
        };
    }

    public setOnCoinFlipStateChanged(callback: (state: CoinFlipState) => void): void {
        this.onCoinFlipStateChanged = callback;
    }




    public setCoinFlipTimeout(timeoutCallback: () => Promise<void>) {
        const flipAbortTime = Date.now() + 1000 * 60 * CoinFlipSession.TIMEOUT_IN_MINUTES;
        this.coinFlipTimeout = setTimeout(async () => {
            if (Date.now() >= flipAbortTime && this.flipInProgress()) {
                await timeoutCallback();
            }
        }, flipAbortTime - Date.now());
    }


    public updateCoinFlipStage(newStage: CoinFlipStage): void {
        this.coinFlipState.stage = newStage;
        if (this.onCoinFlipStateChanged) {
            this.onCoinFlipStateChanged(this.coinFlipState);
        }
    }


    public startNewSessionWithUsers(peerNames: string[]) {
        this.resetCoinFlipSession();
        this.updateCoinFlipStage(CoinFlipStage.IDLE);
        this.coinFlipState.otherUsers = peerNames;
    }

    public flipCompleted(): boolean {
        const idleStages = [CoinFlipStage.FINISHED, CoinFlipStage.ABORTED];
        return idleStages.includes(this.coinFlipState.stage);
    }

    public flipInProgress(): boolean {
        const inProgressStages = [CoinFlipStage.STARTED, CoinFlipStage.COMMITMENT_SENT, CoinFlipStage.REVEAL_SENT];
        return inProgressStages.includes(this.coinFlipState.stage);
    }

    public setRandomValue() {
        this.coinFlipState.v = generateRandomValue();
    }

    public getValue(): number {
        return this.coinFlipState.v;
    }

    public getNonce(): number {
        return this.coinFlipState.nonce;
    }

    public setRandomNonce() {
        this.coinFlipState.nonce = generateRandomNonce();
    }

    public async setCommitment(userId: string) {
        this.coinFlipState.commitment = await generateCommitment(userId, this.coinFlipState.v, this.coinFlipState.nonce);
    }

    public getCommitment(): string {
        return this.coinFlipState.commitment;
    }

    public getCommitmentFor(userId: string): string | undefined {
        return this.coinFlipState.receivedCommitments.get(userId)
    }

    public async doesCommitmentMatch(senderId: string, v: number, nonce: number): Promise<boolean> {
        const expectedCommitment = await generateCommitment(senderId, v, nonce);
        const receivedCommitment = this.getCommitmentFor(senderId);
        return receivedCommitment === expectedCommitment;
    }


    public computeOutcome() {
        let sum = this.coinFlipState.v;
        for (const value of this.coinFlipState.revealedValues.values()) {
            sum += value;
        }
        console.log("SUM = " + sum);
        console.log("MyValue = " + this.coinFlipState.v);
        const flipResult = sum % 2 === 0 ? 'HEADS' : 'TAILS';
        console.log(`Coin flip outcome: ${flipResult}`);
        this.coinFlipState.flipOutcome = {
            result: flipResult,
            error: undefined
        }
    }


    // Add a user to the CoinFlipState
    public addUser(userId: string) {
        this.coinFlipState.otherUsers.push(userId);
    }

    public removeUser(userId: string) {
        this.coinFlipState.otherUsers = this.coinFlipState.otherUsers.filter(user => user !== userId);
    }


    public setFlipOutcome(outcome: FlipResult) {
        this.coinFlipState.flipOutcome = outcome;
    }

    public getOtherUsers() {
        return this.coinFlipState.otherUsers;
    }

    public setOtherUsers(otherUsers: string[]) {
        this.coinFlipState.otherUsers = otherUsers;
    }

    public isUserInSession(userId: string) {
        return this.coinFlipState.otherUsers.includes(userId);
    }

    public getCoinFlipState() {
        return this.coinFlipState;
    }

    public getCoinFlipStage() {
        return this.coinFlipState.stage;
    }

    public setStartCoinFlipReceived(userId: string) {
        this.coinFlipState.receivedStartCoinFlip.set(userId, true);
    }

    public nCoinFlipStarts(): number {
        return this.coinFlipState.receivedStartCoinFlip.size;
    }

    public setCommitmentReceived(userId: string, commitment: string) {
        this.coinFlipState.receivedCommitments.set(userId, commitment);
    }

    public nCommitmentsReceived(): number {
        return this.coinFlipState.receivedCommitments.size;
    }

    public setReveals(userId: string, v: number, nonce: number) {
        this.coinFlipState.revealedValues.set(userId, v);
        this.coinFlipState.revealedNonces.set(userId, nonce);
    }

    public nReveals() {
        return this.coinFlipState.revealedValues.size;
    }

}
