import 'server-only';
import { jwtVerify, SignJWT } from 'jose';
import { hkdf } from '@panva/hkdf';
import type { SessionSchema } from '@/schemas/auth/session.schema';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_SALT = process.env.JWT_SALT;

if (!JWT_SECRET || !JWT_SALT) {
  throw new Error('JWT_SECRET and JWT_SALT must be set');
}

const JWT_EXPIRES_IN = '1d';

let JWT_SECRET_KEY: Uint8Array<ArrayBufferLike>;

const getJwtSecretKey = async () => {
  if (!JWT_SECRET_KEY) {
    JWT_SECRET_KEY = await hkdf('sha512', JWT_SECRET, JWT_SALT, '', 64);
  }
  return JWT_SECRET_KEY;
};

export const generateToken = async (data: SessionSchema) => {
  const key = await getJwtSecretKey();
  return new SignJWT(data)
    .setProtectedHeader({ alg: 'HS512' })
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(key);
};

export const verifyToken = async (token: string) => {
  const key = await getJwtSecretKey();
  return jwtVerify(token, key);
};
