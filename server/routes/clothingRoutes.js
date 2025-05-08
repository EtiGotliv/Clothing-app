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
      let cleanResult = result;
      
      if (result.includes('```')) {
        cleanResult = result.replace(/```(json|jsoon|javascript)?\n/, '');
        cleanResult = cleanResult.replace(/```\s*$/, '');
      }
      
      console.log("Cleaned result:", cleanResult);
      
      const parsed = JSON.parse(cleanResult);
      return res.json(parsed);
    } catch (err) {
      console.warn("⚠️ Failed to parse AI result:", err.message);
      console.log("Result received:", result);
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

router.delete('/delete/:id', checkAuthMiddleware, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid ID" });

  try {
    const deleted = await Clothing.findOneAndDelete({ _id: id, user: req.userId });
    if (!deleted) return res.status(404).json({ message: "Item not found or unauthorized" });
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
});
router.put('/update/:id', checkAuthMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, color, image, tags } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid ID" });
  }

  try {
    const updatedItem = await Clothing.findOneAndUpdate(
      { _id: id, user: req.userId },
      { name, color, image, tags },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ success: false, message: "Item not found or unauthorized" });
    }

    res.json({ success: true, message: "Item updated successfully", item: updatedItem });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed", error: error.message });
  }
});


router.get('/suggest-outfit-from-db', checkAuthMiddleware, suggestOutfitFromClothingDB);

export default router;