import express from 'express';
import authenticateToken from '../middleware/authMiddleware';

const router = express.Router();

// רוט מוגן: רק למשתמשים מחוברים
router.get('/user-info', authenticateToken, (req, res) => {
  res.json({ message: `Welcome user ${req.userId}` });
});

export default router;
