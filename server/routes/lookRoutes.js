import express from "express";
import {
  createSmartLookFromAI,
  getAllLooks,
  toggleFavoriteLook,
  getFavoriteLooks
} from "../controllers/lookController.js";
import verifyUser from "../middleware/verifyUser.js";

const router = express.Router();

router.post("/smart", verifyUser, createSmartLookFromAI);
router.get("/all", verifyUser, getAllLooks);
router.get("/favorites", verifyUser, getFavoriteLooks);
router.patch("/:lookId/favorite", verifyUser, toggleFavoriteLook);

export default router;
