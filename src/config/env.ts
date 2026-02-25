const requiredKeys: string[] = [
  'GECKO_API_KEY',
  'MONGODB_PASSW',
  'JWT_SECRET',
  'SMTP_USER',
  'SMTP_PASS',
];

const missingKeys = requiredKeys.filter((key) => !process.env[key]);

if (missingKeys.length > 0) {
  throw new Error(`Missing required env vars: ${missingKeys.join(', ')}`);
}

export const config = {
  port: parseInt(process.env.PORT || '8000', 10),
  mongoUri: process.env.MONGODB_PASSW ?? 'mongodb://localhost:27017',
  geckoKey: process.env.GECKO_API_KEY,
  jwtSecret: process.env.JWT_SECRET || 'coineristhebest123',
  emailUser: process.env.SMTP_USER,
  emailPass: process.env.SMTP_PASS,
  isDev: process.env.NODE_ENV === 'development',
} as const;