import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import clothingRoutes from './routes/clothingRoutes.js';
import lookRoutes from './routes/lookRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import { User, connectDB } from '../config/MongoDB.mjs';
import tipRoutes from './routes/tipRoutes.js';



dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/clothes', clothingRoutes);
app.use('/api/looks', lookRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/tips', tipRoutes);


const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
