import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import * as userController from "../controllers/userController.js";

const router = Router();

router.use(requireAuth);

router.get("/profile", userController.getProfile);
router.put("/update", userController.updateProfile);
router.get("/me", userController.getProfile);
router.patch("/me", userController.updateProfile);
router.delete("/me", userController.deleteAccount);
router.get("/activity", userController.getActivityLogs);

export default router;
