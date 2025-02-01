import express from 'express';
import Clothing from '../../config/models/allClothing.js';

const router = express.Router();

// הוספת פריט חדש למסד הנתונים
router.post('/add', async (req, res) => {
  try {
    const { name, color, image, tags } = req.body;

    // יצירת מסמך חדש (ללא שדה id, MongoDB יוצר _id אוטומטית)
    const newClothing = new Clothing({
      name,
      color,
      image,
      tags: tags || []
    });

    const savedClothing = await newClothing.save();
    console.log('✅ Item added:', savedClothing);
    res.status(201).json(savedClothing);
  } catch (err) {
    console.error('❌ Error adding item:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// קבלת כל פריטי הבגדים – כאן אנו מגדירים את הנתיב הבסיסי '/' כך ש-GET /api/clothes יחזיר את כל הפריטים
router.get('/', async (req, res) => {
  try {
    const clothes = await Clothing.getAllClothing();
    res.json(clothes);
  } catch (err) {
    console.error('❌ Error fetching items:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
