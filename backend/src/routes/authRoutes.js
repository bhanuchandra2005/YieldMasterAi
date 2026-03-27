import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import * as authController from "../controllers/authController.js";

const router = Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.get("/verify-email", authController.verifyEmail);
router.put("/change-password", requireAuth, authController.changePassword);

export default router;
