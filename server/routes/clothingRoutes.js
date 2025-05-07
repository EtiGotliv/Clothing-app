import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import Clothing from '../../config/models/allClothing.js';
import { analyzeClothingImage } from '../services/openaiService.js';
import { suggestOutfitFromClothingDB } from '../controllers/clothingController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

export function checkAuthMiddleware(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  req.userId = new mongoose.Types.ObjectId(userId);
  next();
}

router.post("/analyze", upload.single("file"), async (req, res) => {
  const fileBuffer = req.file?.buffer;
  if (!fileBuffer) return res.status(400).json({ error: "No image provided" });

  const base64Image = fileBuffer.toString("base64");

  try {
    const result = await analyzeClothingImage(base64Image);
    console.log("Raw AI result:", result);
    
    try {
      // נקה סימני markdown אם קיימים
      let cleanResult = result;
      
      // מסיר את סימוני הקוד של markdown (```json וכו')
      if (result.includes('```')) {
        // הסר את השורה הראשונה אם היא מכילה רק סימני קוד והגדרת שפה
        cleanResult = result.replace(/```(json|jsoon|javascript)?\n/, '');
        // הסר את הסימנים המסיימים
        cleanResult = cleanResult.replace(/```\s*$/, '');
      }
      
      console.log("Cleaned result:", cleanResult);
      
      // נסה לפרסר את התוצאה המנוקה
      const parsed = JSON.parse(cleanResult);
      return res.json(parsed);
    } catch (err) {
      console.warn("⚠️ Failed to parse AI result:", err.message);
      console.log("Result received:", result);
      // שלח את התוצאה המקורית אם הפרסור נכשל
      return res.json({ name: "", color: "", season: "", event: "" });
    }
  } catch (error) {
    console.error("❌ AI error:", error);
    return res.status(500).json({ error: "AI analysis failed" });
  }
});

router.post('/', checkAuthMiddleware, async (req, res) => {
  const { name, color, tags, image } = req.body;
  if (!name || !image) return res.status(400).json({ message: "Missing required fields" });

  try {
    const newClothing = new Clothing({
      name,
      color: color || '',
      tags: Array.isArray(tags) ? tags : [],
      image,
      user: req.userId,
    });

    const saved = await newClothing.save();
    res.status(201).json({ message: "Clothing item saved", item: { id: saved._id, name: saved.name } });
  } catch (error) {
    res.status(500).json({ message: "Save failed", error: error.message });
  }
});

router.get('/', checkAuthMiddleware, async (req, res) => {
  try {
    const clothes = await Clothing.find({ user: req.userId });
    res.json(clothes);
  } catch (error) {
    res.status(500).json({ message: "Fetch failed", error: error.message });
  }
});

router.get("/search", checkAuthMiddleware, async (req, res) => {
  const { query } = req.query;
  if (!query) return res.json([]);
  const regex = new RegExp(query, "i");
  const results = await Clothing.find({ name: { $regex: regex }, user: req.userId });
  res.json(results);
});

router.get('/suggest-outfit-from-db', checkAuthMiddleware, suggestOutfitFromClothingDB);

export default router;