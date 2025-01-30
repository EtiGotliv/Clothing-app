import express from 'express';
import clothing from '../../config/models/allClothing.js';

const router = express.Router();

// הוספת פריט חדש
router.post('/add', async (req, res) => {
  const { id, name, color, image, tags } = req.body;

  try {
    const newClothing = new Clothing({
      id, 
      name, 
      color, 
      image, 
      tags
    });

    await newClothing.save();
    res.status(201).json(newClothing);  // מחזיר את הפריט שנשמר
  } catch (err) {
    res.status(400).json({ error: err.message });  // שולח הודעת שגיאה ברורה
  }
});

// קבלת כל הבגדים
router.get('/all', async (req, res) => {
  try {
    const clothes = await Clothing.find();
    res.json(clothes);  // מחזיר את כל הבגדים
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
