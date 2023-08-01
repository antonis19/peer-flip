const MAX_NUMBER = 1_000_000;

// Utility function to generate a SHA256 hash
export async function sha256(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateRandomValue(): number {
    // generate a  random number between  0 and MAX_NUMBER , and take modulo 2 to make it 0 or 1
    return Math.floor(Math.random() * MAX_NUMBER) % 2;
}

export function generateRandomNonce(): number {
    // generate random number between 0 and MAX_NUMBER
    return Math.floor(Math.random() * MAX_NUMBER)
}

// Return  sha256(userId || v || nonce)
export async function generateCommitment(userId: string, v: number, nonce: number): Promise<string> {
    const input = `${userId}${v}${nonce}`;
    return sha256(input);
}

export async function doesCommitmentMatch(commitment: string, senderId: string, v: number, nonce: number): Promise<boolean> {
    const expectedCommitment = await generateCommitment(senderId, v, nonce);
    return commitment === expectedCommitment;
}