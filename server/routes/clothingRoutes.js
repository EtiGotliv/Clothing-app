import express from 'express';
import { getAllClothing, getClothingById } from '../controllers/clothingController.js';
import Clothing from '../../config/models/allClothing.js';

const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "❌ יש לספק מחרוזת חיפוש" });
    }

    const clothes = await Clothing.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } },
      ],
    }).limit(5);

    res.json(clothes.map(item => ({
      _id: item._id,
      name: item.name,
      category: item.category,
      image: item.image || "/default-image.jpg"
    })));
  } catch (err) {
    console.error("❌ Error searching items:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/', getAllClothing);
router.get('/:id', getClothingById);

export default router;
