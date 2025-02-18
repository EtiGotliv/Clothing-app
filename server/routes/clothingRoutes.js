// server/routes/clothingRoutes.js
import express from 'express';
import mongoose from 'mongoose';
import Clothing from '../../config/models/allClothing.js';

// Middleware לאימות המשתמש
export function checkAuthMiddleware(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: no user id provided' });
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(401).json({ message: 'Unauthorized: invalid user id' });
  }
  req.userId = new mongoose.Types.ObjectId(userId);
  next();
}

const router = express.Router();

// נתיב לשליפת כל פריטי הבגדים של המשתמש
router.get('/', checkAuthMiddleware, async (req, res) => {
  console.log("In clothingRoutes, userId:", req.userId); // לראות שזה ObjectId

  try {
    const clothes = await Clothing.find({ user: req.userId });
    res.json(clothes);
  } catch (error) {
    console.error('Error fetching clothing items:', error);
    res.status(500).json({ message: 'Could not fetch clothing items', error: error.message });
  }
});

router.get("/search", async (req, res) => {
  const { query } = req.query;
  // שליפת מזהה המשתמש מהכותרת, למשל "x-user-id"
  const userId = req.headers["x-user-id"];
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: no user id provided" });
  }
  if (!query) {
    return res.json([]);
  }
  try {
    const regex = new RegExp(query, "i"); // חיפוש לא תלוי בגודל אותיות
    // ודאי להמיר את userId ל־ObjectId אם נדרש:
    const userObjectId = new mongoose.Types.ObjectId(userId);
    // חיפוש בגדים לפי שם המשתמש וגם לפי מזהה המשתמש
    const results = await Clothing.find({ 
      name: { $regex: regex },
      user: userObjectId 
    });
    res.json(results);
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).json({ message: error.message });
  }
});


export default router;
