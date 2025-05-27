import express from 'express';
import multer from 'multer';
import { 
  analyzeAndParseImage,
  createClothing,
  getAllClothing,
  searchClothing,
  getClothingById,
  deleteClothing,
  updateClothing
} from '../controllers/clothingController.js';
import { suggestOutfitFromClothingDB } from '../controllers/lookController.js';
import verifyUser from '../middleware/verifyUser.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// נתיב לניתוח תמונה עם AI
router.post("/analyze", upload.single("file"), analyzeAndParseImage);

// נתיב ליצירת בגד חדש
router.post("/", verifyUser, createClothing);

// נתיב לקבלת כל הבגדים של המשתמש
router.get("/", verifyUser, getAllClothing);

// נתיב לחיפוש בגדים
router.get("/search", verifyUser, searchClothing);

// נתיב לקבלת בגד בודד לפי ID
router.get("/:id", verifyUser, getClothingById);

// נתיב למחיקת בגד
router.delete("/delete/:id", verifyUser, deleteClothing);

// נתיב לעדכון בגד
router.put("/update/:id", verifyUser, updateClothing);

// נתיב להצעת לוק מהמסד נתונים
router.get('/suggest-outfit-from-db', verifyUser, suggestOutfitFromClothingDB);

export default router;