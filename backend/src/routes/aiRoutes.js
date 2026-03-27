import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import * as aiController from "../controllers/aiController.js";

const router = Router();

router.post("/chat", requireAuth, aiController.chat);
router.post("/vision", requireAuth, aiController.vision);

export default router;
