import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import clothingRoutes from './routes/clothingRoutes.js';
import { User, connectDB } from '../config/MongoDB.mjs';

dotenv.config();

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

connectDB();

// app.use('/api/clothes', (req, res, next) => {
//   next();
// }, clothingRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/clothes', clothingRoutes);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
