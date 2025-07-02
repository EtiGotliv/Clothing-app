import express from "express";
import {
  createSmartLookFromAI,
  getAllLooks,
  toggleFavoriteLook,
  getFavoriteLooks,
  deleteLook,
  saveLookFeedback,         
  getUserPreferenceStats,
  getUserStats,    
  updatePreferenceWeights,
  cleanDuplicateLooks
} from "../controllers/lookController.js";
import verifyUser from "../middleware/verifyUser.js";

const router = express.Router();

router.post("/smart", verifyUser, createSmartLookFromAI);
router.get("/all", verifyUser, getAllLooks);
router.get("/favorites", verifyUser, getFavoriteLooks);
router.patch("/:lookId/favorite", verifyUser, toggleFavoriteLook);
router.delete("/:lookId", verifyUser, deleteLook);
router.get('/stats', verifyUser, getUserStats);
router.post("/feedback", verifyUser, saveLookFeedback);
router.get("/preferences/stats", verifyUser, getUserPreferenceStats); 
router.patch("/preferences/update-weights", verifyUser, updatePreferenceWeights); 
router.get('/clean-duplicates', cleanDuplicateLooks);

export default router;