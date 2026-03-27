import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import * as ctrl from "../controllers/fieldsController.js";

const router = Router();
router.use(requireAuth);

router.get("/", ctrl.list);
router.post("/", ctrl.create);
router.delete("/:id", ctrl.remove);

export default router;
