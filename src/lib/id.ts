import crypto from 'crypto';

/**
 * Normalizes a name by trimming whitespace, collapsing spaces, 
 * converting to lowercase, and keeping only letters
 */
export function normalizeName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

/**
 * Creates a hashed ID from a first name using HMAC-SHA256
 * Returns a short, URL-safe string (first 16 bytes as hex)
 */
export function makeHashedId(firstName: string): string {
  const normalized = normalizeName(firstName);
  const secret = process.env.HASH_SECRET || 'default-secret';
  
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(normalized);
  
  // Return first 16 bytes as hex for a shorter, URL-safe ID
  return hmac.digest('hex').substring(0, 16);
}
