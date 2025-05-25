// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto

const ALGORITHM = 'PBKDF2';
const HASH_ALGORITHM = 'SHA-512';
const ITERATIONS = 210000; // OWASP Standards recommended (minimum) Reference: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2
const KEY_LENGTH_BITS = 512;
const SALT_LENGTH = 16; // 128 bits

function ab2hex(ab: ArrayBuffer): string {
  return Array.from(new Uint8Array(ab))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hex2ab(hex: string): ArrayBuffer {
  const typedArray = new Uint8Array(
    hex.match(/[\da-f]{2}/gi)!.map((h) => parseInt(h, 16))
  );
  return typedArray.buffer;
}

// Constant-time comparison helper
function constantTimeCompare(a: ArrayBuffer, b: ArrayBuffer): boolean {
  const aBytes = new Uint8Array(a);
  const bBytes = new Uint8Array(b);

  if (aBytes.length !== bBytes.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < aBytes.length; i++) {
    result |= aBytes[i] ^ bBytes[i]; // XOR current bytes and OR with accumulated difference
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
    { name: ALGORITHM },
    false,
    ['deriveBits']
  );

  // Derive bits using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: ALGORITHM,
      salt,
      hash: HASH_ALGORITHM,
      iterations: ITERATIONS,
    },
    key,
    KEY_LENGTH_BITS
  );

  // Format: iterations:salt:key (all hex)
  return [
    ITERATIONS.toString(16),
    ab2hex(salt.buffer),
    ab2hex(derivedBits),
  ].join(':');
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const [iterationsStr, saltHex, storedKeyHex] = hashedPassword.split(':');
  const iterations = parseInt(iterationsStr, 16);
  const salt = hex2ab(saltHex);
  const storedKey = hex2ab(storedKeyHex);

  // Import password as crypto key with deriveKey usage
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: ALGORITHM },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: ALGORITHM,
      salt,
      iterations,
      hash: HASH_ALGORITHM,
    },
    key,
    KEY_LENGTH_BITS
  );

  return constantTimeCompare(derivedBits, storedKey);
}
