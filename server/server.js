import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';

// טוען את משתני הסביבה מתוך קובץ .env
dotenv.config();

const app = express();

// הגדרות CORS (אפשרות להתחבר מהקליינט)
const corsOptions = {
  origin: "http://localhost:5173", // כתובת ה-frontend שלך
};

app.use(cors(corsOptions));

// חיבור ל-MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log("Error connecting to MongoDB:", err));

// הגדרת נתיב API
app.get('/api', (req, res) => {
  res.json({ message: "API is working!" });
});

// הגדרת פורט
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
