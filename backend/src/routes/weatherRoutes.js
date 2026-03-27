import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();
router.use(requireAuth);

router.get("/", (req, res) => {
  res.json({
    location: "Hyderabad, IN",
    current: { temp: 28, humidity: 65, condition: "Partly cloudy", wind: 12, pressure: 1013 },
    forecast: [
      { day: "Mon", temp: 28, humidity: 65, rain: 0, condition: "Partly cloudy" },
      { day: "Tue", temp: 27, humidity: 70, rain: 2, condition: "Light rain" },
      { day: "Wed", temp: 29, humidity: 60, rain: 0, condition: "Sunny" },
      { day: "Thu", temp: 26, humidity: 75, rain: 5, condition: "Rain" },
      { day: "Fri", temp: 30, humidity: 55, rain: 0, condition: "Sunny" },
      { day: "Sat", temp: 28, humidity: 68, rain: 1, condition: "Cloudy" },
      { day: "Sun", temp: 27, humidity: 72, rain: 3, condition: "Showers" },
    ],
  });
});

export default router;
