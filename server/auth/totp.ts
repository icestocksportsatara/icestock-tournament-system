import crypto from 'crypto';

// Standard Base32 alphabet (RFC 4648)
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Encodes a buffer to Base32 string
 */
export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Decodes a Base32 string to Buffer
 */
export function base32Decode(input: string): Buffer {
  const cleanInput = input.toUpperCase().replace(/=+$/, '').replace(/[\s-]/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleanInput.length; i++) {
    const idx = BASE32_CHARS.indexOf(cleanInput[i]);
    if (idx === -1) {
      throw new Error(`Invalid Base32 character: ${cleanInput[i]}`);
    }
    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Generates a cryptographically secure 160-bit (20-byte) Base32 secret for TOTP
 */
export function generateTotpSecret(): string {
  const buffer = crypto.randomBytes(20);
  return base32Encode(buffer);
}

/**
 * Generates an RFC 6238 TOTP code for a given timestamp and secret
 */
export function generateTotpCode(secret: string, timeStepSeconds = 30, digits = 6, timestamp = Date.now()): string {
  const key = base32Decode(secret);
  const counter = Math.floor(timestamp / 1000 / timeStepSeconds);
  
  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(counter));

  const hmac = crypto.createHmac('sha1', key);
  hmac.update(buffer);
  const digest = hmac.digest();

  // Dynamic Truncation
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = binary % Math.pow(10, digits);
  return otp.toString().padStart(digits, '0');
}

/**
 * Validates a user-supplied 6-digit TOTP code against the secret with drift window
 * Window = 1 checks: T-1 (30s ago), T (current), T+1 (30s future)
 */
export function verifyTotpCode(token: string, secret: string, window = 1, timeStepSeconds = 30): boolean {
  if (!token || typeof token !== 'string' || !secret) {
    return false;
  }
  const cleanToken = token.trim().replace(/\s+/g, '');
  if (!/^\d{6}$/.test(cleanToken)) {
    return false;
  }

  const now = Date.now();
  for (let i = -window; i <= window; i++) {
    const targetTime = now + i * timeStepSeconds * 1000;
    const generated = generateTotpCode(secret, timeStepSeconds, 6, targetTime);
    // Constant time comparison to prevent timing attacks
    if (crypto.timingSafeEqual(Buffer.from(cleanToken), Buffer.from(generated))) {
      return true;
    }
  }

  return false;
}

/**
 * Generates an otpauth:// URI for QR code generation
 */
export function generateOtpAuthUri(accountName: string, secret: string, issuer = 'IFI Icestock Global'): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(accountName);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Generates standard 8 recovery codes
 */
export function generateRecoveryCodes(count = 8): { plainCodes: string[]; hashedCodes: string[] } {
  const plainCodes: string[] = [];
  const hashedCodes: string[] = [];

  for (let i = 0; i < count; i++) {
    const raw = crypto.randomBytes(5).toString('hex').toUpperCase();
    const formatted = `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 10)}`;
    plainCodes.push(formatted);
    const hash = crypto.createHash('sha256').update(formatted).digest('hex');
    hashedCodes.push(hash);
  }

  return { plainCodes, hashedCodes };
}
