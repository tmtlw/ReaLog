
// Simple utility for SHA-256 hashing using Web Crypto API

export const hashPassword = async (password: string): Promise<string> => {
    if (!password) return '';
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
};

// Verify if a plain password matches the hash
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    const computedHash = await hashPassword(password);
    return computedHash === hash;
};
