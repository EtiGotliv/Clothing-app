import express from 'express';
import cors from 'cors';
import connectDB from '../config/MongoDB.mjs';
import Clothing from '../config/models/allClothing.js';

const app = express();
const port = 8080;

connectDB();

// הגדרת CORS
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};

// middleware
app.use(cors(corsOptions));
app.use(express.json());

// התחברות למסד הנתונים
connectDB();

// נתיבים
app.get('/api/clothing', async (req, res) => {
  try {
    const clothes = await Clothing.getAllClothing();  // שימוש בפונקציה שהגדרנו במודל
    res.json(clothes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clothing', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});