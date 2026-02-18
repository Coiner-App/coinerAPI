const requiredKeys: string[] = [
  'GECKO_API_KEY',
  'MONGODB_PASSW',
];

const missingKeys = requiredKeys.filter((key) => !process.env[key]);

if (missingKeys.length > 0) {
  throw new Error(`Missing required env vars: ${missingKeys.join(', ')}`);
}

export const config = {
  port: parseInt(process.env.PORT || '8000', 10),
  mongoUri: process.env.MONGODB_PASSW,
  geckoKey: process.env.GECKO_API_KEY,
  isDev: process.env.NODE_ENV === 'development',
} as const;