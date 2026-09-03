// PII field-level encryption helper — AES-256-GCM via Node crypto; key from env ENCRYPTION_KEY
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'nivaarn-default-32byte-key!!';
const KEY = scryptSync(ENCRYPTION_KEY, 'nivaaran-salt', 32);
const IV_LEN = 16;
export function encryptPII(plaintext: string): string {
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv('aes-256-gcm', KEY, iv);
  let enc = cipher.update(plaintext, 'utf8', 'hex');
  enc += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return iv.toString('hex') + ':' + authTag + ':' + enc;
}
export function decryptPII(ciphertext: string): string {
  const [ivHex, authTagHex, enc] = ciphertext.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = createDecipheriv('aes-256-gcm', KEY, iv);
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  let dec = decipher.update(enc, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}
