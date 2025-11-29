import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../.env') });

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import allRoutes from './routes/allRoutes.js';

const app = express();

app.use(cors({
  origin: [
    "https://luxenest-homestyle.netlify.app/"
    
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api', allRoutes);

app.get('/', (req, res) => res.send('LuxeNest MERN Backend Running!'));

console.log('MONGO_URI loaded:', !!process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(5000, () => console.log('Backend → http://localhost:5000'));
  })
  .catch(err => console.error('MongoDB connection error:', err));