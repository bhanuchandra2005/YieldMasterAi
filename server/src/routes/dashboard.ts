import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

const yieldData = [
  { month: "Jan", rice: 2400, wheat: 1800, maize: 1200 },
  { month: "Feb", rice: 2200, wheat: 2100, maize: 1400 },
  { month: "Mar", rice: 2800, wheat: 2400, maize: 1600 },
  { month: "Apr", rice: 3200, wheat: 2000, maize: 1900 },
  { month: "May", rice: 3600, wheat: 1700, maize: 2200 },
  { month: "Jun", rice: 3900, wheat: 1500, maize: 2600 },
  { month: "Jul", rice: 4200, wheat: 1800, maize: 2800 },
  { month: "Aug", rice: 3800, wheat: 2200, maize: 2400 },
];

const weatherData = [
  { day: "Mon", temp: 28, humidity: 72, rain: 12 },
  { day: "Tue", temp: 31, humidity: 65, rain: 0 },
  { day: "Wed", temp: 29, humidity: 78, rain: 24 },
  { day: "Thu", temp: 27, humidity: 82, rain: 35 },
  { day: "Fri", temp: 30, humidity: 70, rain: 8 },
  { day: "Sat", temp: 33, humidity: 60, rain: 0 },
  { day: "Sun", temp: 32, humidity: 68, rain: 5 },
];

const cropDistribution = [
  { name: "Rice", value: 35, color: "hsl(142, 64%, 36%)" },
  { name: "Wheat", value: 28, color: "hsl(42, 92%, 56%)" },
  { name: "Maize", value: 20, color: "hsl(200, 80%, 55%)" },
  { name: "Cotton", value: 17, color: "hsl(25, 95%, 53%)" },
];

const recentActivity = [
  { action: "Yield prediction completed", crop: "Rice - Kharif 2026", time: "2 min ago", icon: "sprout" },
  { action: "Weather alert received", crop: "Heavy rainfall expected", time: "1 hour ago", icon: "cloud-rain" },
  { action: "Soil analysis uploaded", crop: "Field #3 - pH 6.8", time: "3 hours ago", icon: "activity" },
  { action: "New prediction request", crop: "Wheat - Rabi 2026", time: "5 hours ago", icon: "trending-up" },
  { action: "Risk assessment updated", crop: "Maize - Pest risk low", time: "1 day ago", icon: "leaf" },
];

dashboardRouter.get("/stats", (_req, res) => {
  res.json({
    avgYield: "3,847 kg/ha",
    avgYieldTrend: "12.5%",
    avgYieldTrendUp: true,
    temperature: "29°C",
    tempTrend: "2°C",
    tempTrendUp: false,
    rainfall: "124 mm",
    rainfallTrend: "18%",
    rainfallTrendUp: true,
    predictionsCount: "47",
    predictionsTrend: "8",
    predictionsTrendUp: true,
  });
});

dashboardRouter.get("/yield-trends", (_req, res) => res.json(yieldData));
dashboardRouter.get("/weather", (_req, res) => res.json(weatherData));
dashboardRouter.get("/crop-distribution", (_req, res) => res.json(cropDistribution));
dashboardRouter.get("/activity", (_req, res) => res.json(recentActivity));
