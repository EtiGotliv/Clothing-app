import express from 'express';
import Clothing from '../../config/models/allClothing.js';

const router = express.Router();

router.post('/add', async (req, res) => {
    const { id, name, color, image, tags } = req.body;
  
    try {
      const newClothing = new Clothing({
        id,
        name,
        color,
        image,
        tags, 
      });
  
      await newClothing.save();
      res.status(201).json(newClothing);
    } catch (err) {
      res.status(400);
    }
  });
  
  
  export default router;