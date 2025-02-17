import express from 'express';
import { getUserCount, signup, getUserProfile } from '../controllers/userController.js';
import authenticateToken from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/signup', signup); // אם אתם משתמשים גם כאן בהרשמה
router.get('/count', getUserCount);
// נתיב חדש לקבלת פרופיל המשתמש
router.get('/me', authenticateToken, getUserProfile);

export default router;
