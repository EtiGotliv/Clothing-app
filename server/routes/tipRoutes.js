// routes/tipRoutes.js
import express from 'express';
import { getTips, addTip } from '../controllers/tipController.js';
import verifyUser from '../middleware/verifyUser.js';
import isAdmin from '../middleware/isAdmin.js';

const router = express.Router();

router.get('/', getTips);
router.post('/add', verifyUser, isAdmin, addTip);

export default router;
