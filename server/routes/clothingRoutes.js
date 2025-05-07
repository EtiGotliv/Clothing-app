// server/routes/clothingRoutes.js
import express from 'express';
import mongoose from 'mongoose';
import Clothing from '../../config/models/allClothing.js';

export function checkAuthMiddleware(req, res, next) {
  const userId = req.headers['x-user-id'];
  console.log("Received request with x-user-id:", userId);
  
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: no user id provided' });
  }
  
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(401).json({ message: 'Unauthorized: invalid user id format' });
  }
  
  req.userId = new mongoose.Types.ObjectId(userId);
  next();
}

const router = express.Router();

router.get('/', checkAuthMiddleware, async (req, res) => {
  console.log("In clothingRoutes GET, userId:", req.userId);

  try {
    const clothes = await Clothing.find({ user: req.userId });
    res.json(clothes);
  } catch (error) {
    console.error('Error fetching clothing items:', error);
    res.status(500).json({ message: 'Could not fetch clothing items', error: error.message });
  }
});


router.post('/', checkAuthMiddleware, async (req, res) => {
  console.log("In clothingRoutes POST, userId:", req.userId);
  console.log("Request body keys:", Object.keys(req.body));
  
  try {
    const { name, color, tags, image } = req.body;
    
    if (!name || !image) {
      return res.status(400).json({ message: "Missing required fields: name and image are required" });
    }
    
    const newClothing = new Clothing({
      name,
      color: color || '',
      tags: Array.isArray(tags) ? tags : [],
      image,
      user: req.userId
    });
    
    const savedClothing = await newClothing.save();
    console.log("Saved new clothing item:", savedClothing._id);
    
    res.status(201).json({
      message: "Clothing item saved successfully",
      item: {
        id: savedClothing._id,
        name: savedClothing.name
      }
    });
  } catch (error) {
    console.error("Error saving clothing item:", error);
    res.status(500).json({ message: "Failed to save item", error: error.message });
  }
});

router.get("/search", checkAuthMiddleware, async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.json([]);
  }
  
  try {
    const regex = new RegExp(query, "i");
    const results = await Clothing.find({
      name: { $regex: regex },
      user: req.userId
    });
    res.json(results);
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;