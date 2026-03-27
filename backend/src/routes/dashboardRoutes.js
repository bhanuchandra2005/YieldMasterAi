import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import * as dashboardController from "../controllers/dashboardController.js";

const router = Router();

router.use(requireAuth);

router.get("/stats", dashboardController.getStats);
router.get("/yield-trends", dashboardController.getYieldTrends);
router.get("/weather", dashboardController.getWeather);
router.get("/crop-distribution", dashboardController.getCropDistribution);
router.get("/activity", dashboardController.getActivity);

export default router;
