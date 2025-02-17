import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from '../config/MongoDB.mjs'
import authRoutes from './routes/authRoutes.js';
import clothingRoutes from './routes/clothingRoutes.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// התחברות למסד הנתונים
connectDB();

// נתיבי האותנטיקציה והבגדים
app.use('/api/auth', authRoutes);
app.use('/api/clothes', clothingRoutes);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
