// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto

const ITERATIONS = 210000; // OWASP Standards recommended (minimum) Reference: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2
const SALT_LENGTH = 16; // 16 bytes (128 bits)

// Constant-time comparison helper
function constantTimeCompare(a: ArrayBuffer, b: ArrayBuffer): boolean {
  const aBytes = new Uint8Array(a);
  const bBytes = new Uint8Array(b);

  if (aBytes.length !== bBytes.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < aBytes.length; i++) {
    result |= aBytes[i] ^ bBytes[i];
  }
  return result === 0;
}

export async function hashPassword(password: string): Promise<string> {
  // Generate random salt
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

  // Import password as crypto key with deriveKey usage
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive key using PBKDF2
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-512',
      salt,
      iterations: ITERATIONS,
    },
    key,
    { name: 'HMAC', hash: 'SHA-512' },
    true,
    ['sign']
  );

  // Export derived key
  const exportedKey = await crypto.subtle.exportKey('raw', derivedKey);

  // Format: iterations:salt:key (all in hex)
  return [
    ITERATIONS.toString(16),
    Buffer.from(salt).toString('hex'),
    Buffer.from(exportedKey).toString('hex'),
  ].join(':');
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const [iterationsHex, saltHex, storedKeyHex] = hashedPassword.split(':');
  const iterations = parseInt(iterationsHex, 16);
  const salt = Buffer.from(saltHex, 'hex');
  const storedKey = Buffer.from(storedKeyHex, 'hex');

  // Import password as crypto key with deriveKey usage
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-512',
    },
    key,
    { name: 'HMAC', hash: 'SHA-512' },
    true,
    ['sign']
  );

  const exportedKey = await crypto.subtle.exportKey('raw', derivedKey);

  // Convert storedKey to ArrayBuffer
  const storedKeyArrayBuffer = storedKey.buffer.slice(
    storedKey.byteOffset,
    storedKey.byteOffset + storedKey.byteLength
  );

  // Use our constant-time comparison
  return constantTimeCompare(exportedKey, storedKeyArrayBuffer);
}
