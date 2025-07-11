// controllers/tipController.js
import { Tip } from '../../config/MongoDB.mjs';

export const getTips = async (req, res) => {
  try {
    const tips = await Tip.find();
    res.json(tips);
  } catch (error) {
    res.status(500).json({ error: "שגיאה בטעינת הטיפים" });
  }
};

export const addTip = async (req, res) => {
  const { category, text } = req.body;
  if (!category || !text) {
    return res.status(400).json({ error: "חסר קטגוריה או תוכן" });
  }

  try {
    const newTip = await Tip.create({ category, text });
    res.json({ success: true, tip: newTip });
  } catch (error) {
    res.status(500).json({ error: "שגיאה בשמירת הטיפ" });
  }
};
