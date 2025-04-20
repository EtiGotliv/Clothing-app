// server/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import clothingRoutes from './routes/clothingRoutes.js';
import { User, connectDB } from '../config/MongoDB.mjs';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// נתיב בסיסי לבדיקה
app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

// נתיב כניסה (login)
app.post("/", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (user) {
      // משתמש קיים – מחזירים גם את השם
      return res.json({ status: "success", userId: user._id, name: user.name });
    } else {
      // משתמש לא קיים
      return res.json({ status: "notexist" });
    }
  } catch (error) {
    console.error(error);
    return res.json({ status: "fail" });
  }
});



// נתיב הרשמה (signup)
app.post("/Signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const check = await User.findOne({ email });
    if (check) {
      return res.json("exist");
    }
    const newUser = await User.create({ name, email, password });
    // החזר את המשתמש החדש בצורה שמתאימה לציפיות הקליינט
    return res.json({ status: "success", userId: newUser._id });
  } catch (error) {
    console.error(error);
    return res.json({ status: "fail", error: error.message });
  }
});


// התחברות למסד הנתונים
connectDB();


app.use('/api/clothes', (req, res, next) => {
  console.log("Request arrived to /api/clothes with x-user-id:", req.headers['x-user-id']);
  next();
}, clothingRoutes);

// שימוש בנתיבי האותנטיקציה והבגדים
app.use('/api/auth', authRoutes);
app.use('/api/clothes', clothingRoutes);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
