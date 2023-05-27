// Utility function to generate a SHA256 hash
export async function sha256(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateRandomValue(): number {
    return Math.floor(Math.random() * 1000000);
}

export function generateRandomNonce(): string {
    return Math.random().toString(36).substring(2);
}

export async function generateCommitment(userId: string, v: number, nonce: string): Promise<string> {
    const input = `${userId}${v}${nonce}`;
    return sha256(input);
}