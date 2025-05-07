// server/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import clothingRoutes from './routes/clothingRoutes.js';
import { User, connectDB } from '../config/MongoDB.mjs';

dotenv.config();

const app = express();

// app.use(express.json());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

app.post("/", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (user) {
      return res.json({ status: "success", userId: user._id, name: user.name });
    } else {
      return res.json({ status: "notexist" });
    }
  } catch (error) {
    console.error(error);
    return res.json({ status: "fail" });
  }
});


app.post("/Signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const check = await User.findOne({ email });
    if (check) {
      return res.json("exist");
    }
    const newUser = await User.create({ name, email, password });
    return res.json({ status: "success", userId: newUser._id });
  } catch (error) {
    console.error(error);
    return res.json({ status: "fail", error: error.message });
  }
});


connectDB();


app.use('/api/clothes', (req, res, next) => {
  // const token = req.headers["authorization"]?.split(" ")[1]; // מחפש את ה-Bearer Token
  // if (!token) {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }
  // console.log("Request arrived to /api/clothes with x-user-id:", req.headers['x-user-id']);
  // console.log("Token from localStorage:", token);
  next();
}, clothingRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/clothes', clothingRoutes);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
