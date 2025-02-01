import express from 'express';
import cors from 'cors';
import connectDB from '../config/MongoDB.mjs';
import Clothing from '../config/models/allClothing.js'; // לוודא שזה הנתיב הנכון
import router from './routes/clothingRoutes.js';

const app = express();
const port = 8080;

// הגדרת CORS
const corsOptions = {
  origin: 'http://localhost:3000', // רק כתובת זו מורשת
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));


// Middleware
app.use(express.json());
app.use('/api/clothes', router);

// התחברות למסד הנתונים
connectDB();

// בדיקה אם המסד מחובר
app.get('/api/health', (req, res) => {
  res.json({ status: '✅ Server is running!' });
});

// שליפת הבגדים מהמסד
app.get('/api/clothes', async (req, res) => {
  try {
    const clothes = await Clothing.getAllClothing();
    res.json(clothes);
  } catch (error) {
    console.error('❌ Error fetching clothes:', error);
    res.status(500).json({ message: 'Database Error', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
