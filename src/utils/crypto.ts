import { randomBytes } from 'crypto';
import { promisify } from 'util';

/**
 * Returns a promise that resolves to a buffer of cryptographically strong pseudo-random data.
 */
export const randomBytesAsync = promisify(randomBytes);
