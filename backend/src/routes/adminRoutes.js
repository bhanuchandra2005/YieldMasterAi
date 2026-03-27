import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import * as adminController from "../controllers/adminController.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole("ADMIN"));

router.get("/users", adminController.listUsers);
router.delete("/users/:id", adminController.deleteUser);
router.get("/analytics", adminController.analytics);

export default router;
