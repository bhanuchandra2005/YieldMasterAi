import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import * as ctrl from "../controllers/predictionsController.js";
import { predictYield } from "../controllers/predictYieldController.js";

const router = Router();
router.use(requireAuth);

router.get("/", ctrl.list);
router.post("/", ctrl.create);
router.post("/predict-yield", predictYield);
router.get("/:id", ctrl.getOne);
router.delete("/:id", ctrl.remove);

export default router;
