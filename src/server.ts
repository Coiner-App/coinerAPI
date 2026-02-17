import * as dotenv from 'dotenv';
import { buildApp } from './app.js';


dotenv.config();

const start = async () => {

    const app = await buildApp();

  try {
    const port = parseInt(process.env.PORT || '8000');
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Server running on http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();