import { error } from "console";

const requiredKeys: string[] = [
  'GECKO_API_KEY',
  'MONGODB_URI',
  'JWT_SECRET',
  'SMTP_USER',
  'SMTP_PASS',
];

const missingKeys = requiredKeys.filter((key) => !process.env[key]);

if (missingKeys.length > 0) {
  throw new Error(`Missing required env vars: ${missingKeys.join(', ')}`);
}

const jwtSecretKey = process.env.JWT_SECRET ?? 'coineristhebestappever1234567890';
if (jwtSecretKey.length < 34) throw Error('JWT_SECRET must be at least 34 characters long'); // jose requirement
const k = Buffer.from(jwtSecretKey).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export const config = {
  port: parseInt(process.env.PORT || '8000', 10),
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017',
  geckoKey: process.env.GECKO_API_KEY,
  jwtSecretKey: jwtSecretKey,
  jwkSecret: { k, kty: 'oct', alg: 'HS256' },
  emailUser: process.env.SMTP_USER,
  emailPass: process.env.SMTP_PASS,
  isDev: process.env.NODE_ENV === 'development',
} as const;