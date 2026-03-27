import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { getMarketPrices } from "../controllers/marketController.js";

const router = Router();
router.get("/prices", requireAuth, getMarketPrices);

export default router;
