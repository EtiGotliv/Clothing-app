import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import Clothing from '../../config/models/allClothing.js';
import { analyzeClothingImage } from '../services/openaiService.js';
import { suggestOutfitFromClothingDB } from '../controllers/clothingController.js';
import { VALID_TYPES, TYPE_MAP, MAX_COLORS, IGNORED_COLOR_TERMS } from '../../config/clothingConfig.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

function mapToValidType(type) {
  if (!type) return null;
  if (VALID_TYPES.includes(type)) return type;
  if (TYPE_MAP[type]) return TYPE_MAP[type];

  const normalized = type.toLowerCase();

  for (const validType of VALID_TYPES) {
    if (normalized.includes(validType.toLowerCase())) {
      return validType;
    }
  }

  for (const [key, mapped] of Object.entries(TYPE_MAP)) {
    if (normalized.includes(key.toLowerCase())) {
      return mapped;
    }
  }

  return null;
}

function extractMainColors(colorString) {
  if (!colorString) return [];
  const colorList = colorString
    .split(',')
    .map(c => c.trim().toLowerCase())
    .filter(c =>
      c.length > 0 &&
      !IGNORED_COLOR_TERMS.some(term => c.includes(term))
    );
  return colorList.slice(0, MAX_COLORS);
}

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

      const parsed = JSON.parse(cleanResult);
      const mappedType = mapToValidType(parsed.name);
      const cleanedColors = extractMainColors(parsed.color);

      return res.json({
        name: mappedType || "",
        color: cleanedColors.join(", "),
        season: parsed.season,
        event: parsed.event,
        needsManualInput: !mappedType || cleanedColors.length === 0
      });

    } catch (err) {
      console.warn("⚠️ Failed to parse AI result:", err.message);
      console.log("Result received:", result);
      return res.json({ name: "", color: "", season: "", event: "", needsManualInput: true });
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

// New route to get single clothing item - must be after /search
router.get('/:id', checkAuthMiddleware, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    const item = await Clothing.findOne({ _id: id, user: req.userId });
    if (!item) {
      return res.status(404).json({ message: "Item not found or unauthorized" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Fetch failed", error: error.message });
  }
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
