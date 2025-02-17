import express from 'express';
import Clothing from '../../config/models/allClothing.js';
import { checkAuthMiddleware } from '../util/auth.js';

const router = express.Router();

// יצירת פריט בגדים חדש עבור המשתמש המחובר
router.post('/', checkAuthMiddleware, async (req, res) => {
  try {
    const newClothing = new Clothing({
      ...req.body,       // מכיל שדות כמו name, color, image וכו'
      user: req.userId   // קישור לפרטי המשתמש המחובר
    });
    await newClothing.save();
    res.status(201).json({ message: 'Item created.', item: newClothing });
  } catch (error) {
    res.status(500).json({ message: 'Could not create clothing item', error: error.message });
  }
});

// שליפת כל פריטי הבגדים של המשתמש המחובר
router.get('/', checkAuthMiddleware, async (req, res) => {
  try {
    const clothes = await Clothing.find({ user: req.userId });
    res.json(clothes);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch clothing items', error: error.message });
  }
});

// שליפת פריט בודד לפי id עבור המשתמש המחובר
router.get('/:id', checkAuthMiddleware, async (req, res) => {
  try {
    const clothingItem = await Clothing.findOne({ _id: req.params.id, user: req.userId });
    if (!clothingItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(clothingItem);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clothing item', error: error.message });
  }
});

export default router;
