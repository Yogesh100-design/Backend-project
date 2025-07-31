// index.js
import dotenv from 'dotenv';
import { app } from './app.js';
import connectDB from './db/index.js';

dotenv.config({ path: './.env' });

connectDB().then(() => {
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});
