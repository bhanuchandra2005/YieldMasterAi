export function getStats(req, res, next) {
  res.json({
    avgYield: "4.2",
    avgYieldTrend: "+12%",
    avgYieldTrendUp: true,
    temperature: "28°C",
    tempTrend: "+2%",
    tempTrendUp: true,
    rainfall: "45mm",
    rainfallTrend: "-5%",
    rainfallTrendUp: false,
    predictionsCount: "24",
    predictionsTrend: "+8",
    predictionsTrendUp: true,
  });
}

export function getYieldTrends(req, res, next) {
  res.json([
    { month: "Jan", rice: 3.2, wheat: 2.8, maize: 4.1 },
    { month: "Feb", rice: 3.5, wheat: 3.0, maize: 4.3 },
    { month: "Mar", rice: 3.8, wheat: 3.2, maize: 4.5 },
    { month: "Apr", rice: 4.0, wheat: 3.4, maize: 4.6 },
    { month: "May", rice: 4.2, wheat: 3.6, maize: 4.8 },
    { month: "Jun", rice: 4.5, wheat: 3.8, maize: 5.0 },
  ]);
}

export function getWeather(req, res, next) {
  res.json([
    { day: "Mon", temp: 28, humidity: 65, rain: 0 },
    { day: "Tue", temp: 27, humidity: 70, rain: 2 },
    { day: "Wed", temp: 29, humidity: 60, rain: 0 },
    { day: "Thu", temp: 26, humidity: 75, rain: 5 },
    { day: "Fri", temp: 30, humidity: 55, rain: 0 },
    { day: "Sat", temp: 28, humidity: 68, rain: 1 },
    { day: "Sun", temp: 27, humidity: 72, rain: 3 },
  ]);
}

export function getCropDistribution(req, res, next) {
  res.json([
    { name: "Rice", value: 35, color: "#22c55e" },
    { name: "Wheat", value: 28, color: "#eab308" },
    { name: "Maize", value: 22, color: "#f97316" },
    { name: "Other", value: 15, color: "#94a3b8" },
  ]);
}

export function getActivity(req, res, next) {
  res.json([
    { action: "Yield predicted", crop: "Rice", time: "2 hours ago", icon: "sprout" },
    { action: "Weather updated", crop: "All", time: "5 hours ago", icon: "cloud-rain" },
    { action: "Field added", crop: "North", time: "Yesterday", icon: "activity" },
    { action: "Report generated", crop: "Wheat", time: "2 days ago", icon: "trending-up" },
  ]);
}
