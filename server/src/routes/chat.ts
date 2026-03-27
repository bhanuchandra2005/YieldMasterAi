import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

export const chatRouter = Router();
chatRouter.use(requireAuth);

type ChatContext = {
  avgYield?: number; // e.g. 4.2
  temperatureC?: number; // e.g. 28
  rainfallMm?: number; // e.g. 45
  predictions?: number; // e.g. 24
};

function toNum(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function makeReply(message: string, ctx: ChatContext) {
  const m = message.toLowerCase();
  const avgYield = toNum(ctx.avgYield);
  const temp = toNum(ctx.temperatureC);
  const rain = toNum(ctx.rainfallMm);
  const preds = toNum(ctx.predictions);

  const bullets: string[] = [];

  const has = (k: string) => m.includes(k);
  const wantsIrrigation = has("irrig") || has("water") || has("सिंच") || has("irrigate");
  const wantsYield = has("yield") || has("उपज");
  const wantsWeather = has("weather") || has("rain") || has("temperature") || has("मौसम") || has("बारिश");
  const wantsCrops = has("crop") || has("recommend") || has("फसल") || has("recommendation");

  if (wantsIrrigation) {
    if (rain !== undefined && rain < 20) {
      bullets.push("Rainfall looks low — plan a light irrigation today (prefer early morning/evening).");
    } else if (rain !== undefined && rain >= 20 && rain < 60) {
      bullets.push("Rainfall is moderate — irrigate only if topsoil is drying (check 2–3 cm depth).");
    } else if (rain !== undefined && rain >= 60) {
      bullets.push("Rainfall is healthy — skip irrigation for now and avoid waterlogging.");
    } else {
      bullets.push("If soil feels dry at 2–3 cm depth, irrigate lightly today; otherwise wait 24h.");
    }
    if (temp !== undefined && temp >= 32) bullets.push("Heat is high — reduce midday irrigation to limit evaporation.");
  } else if (wantsYield) {
    if (avgYield !== undefined) bullets.push(`Avg yield is about ${avgYield.toFixed(1)} — focus on your weakest field first for fastest gains.`);
    if (temp !== undefined && temp >= 32) bullets.push("High temperature can reduce yield via heat stress — consider shade/windbreaks and timely irrigation.");
    if (rain !== undefined && rain < 20) bullets.push("Low rainfall is a yield risk — prioritize moisture management and mulching.");
    if (preds !== undefined) bullets.push(`You have ${preds} predictions — compare the top 2 crops by confidence and choose the lowest risk.`);
  } else if (wantsWeather) {
    if (temp !== undefined) bullets.push(`Temperature is ~${temp.toFixed(0)}°C — watch for stress above 32°C.`);
    if (rain !== undefined) bullets.push(`Rainfall is ~${rain.toFixed(0)}mm — below 20mm is typically irrigation territory.`);
    bullets.push("If you see a dry spell (3+ days), schedule irrigation + reduce nitrogen top-dressing until moisture improves.");
  } else if (wantsCrops) {
    bullets.push("Quick crop recs (general):");
    bullets.push("• Moderate heat + limited rain: millets / pulses can be safer than water-heavy crops.");
    bullets.push("• If irrigation is available: rice/vegetables can work, but monitor pests + humidity.");
    bullets.push("Tell me your region + soil type for a better recommendation.");
  } else {
    bullets.push("Ask me about yield insights, irrigation today, weather risks, or crop recommendations.");
    if (temp !== undefined || rain !== undefined) {
      const t = temp !== undefined ? `${temp.toFixed(0)}°C` : "—";
      const r = rain !== undefined ? `${rain.toFixed(0)}mm` : "—";
      bullets.push(`Right now: Temp ${t}, Rain ${r}.`);
    }
  }

  // Keep it short + actionable
  return bullets.slice(0, 4).join("\n");
}

chatRouter.post("/", (req, res) => {
  const body = req.body as { message?: unknown; context?: unknown };
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const contextRaw = (body?.context ?? {}) as Record<string, unknown>;

  if (!message) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  const reply = makeReply(message, {
    avgYield: toNum(contextRaw.avgYield),
    temperatureC: toNum(contextRaw.temperatureC),
    rainfallMm: toNum(contextRaw.rainfallMm),
    predictions: toNum(contextRaw.predictions),
  });

  res.json({ reply });
});

