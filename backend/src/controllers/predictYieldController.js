import { prisma } from "../models/index.js";

/**
 * Yield prediction engine (ML-style regression).
 * Factors: soil factor, weather factor, irrigation factor, fertilizer efficiency.
 * Structured for future integration with:
 * - TensorFlow / PyTorch: replace runYieldModel() with model.predict(features)
 * - Scikit-learn: load pickle/ONNX (e.g. RandomForestRegressor) and predict
 * - OpenWeather API: when temperature/rainfall/humidity are null,
 *   fetch from OpenWeather (e.g. GET api.openweathermap.org/data/2.5/weather?lat=&lon=&appid=)
 *   and pass into input before runYieldModel()
 */

const BASE_YIELD_KG_HA = { Rice: 4200, Wheat: 3500, Maize: 5500, Cotton: 480, Sugarcane: 7200, Other: 3000 };
const SOIL_FACTOR = { Loam: 1.05, Clay: 0.98, Sandy: 0.92, Silt: 1.02, "Loamy Clay": 1.0 };
const IRRIGATION_FACTOR = { Drip: 1.08, Sprinkler: 1.02, Flood: 1.0, None: 0.95 };

function soilFactor(input) {
  const typeMult = SOIL_FACTOR[input.soilType] ?? 1.0;
  const moisture = Math.min(100, Math.max(0, input.soilMoisture ?? 50));
  const moistureMult = 0.8 + (moisture / 100) * 0.4;
  return typeMult * moistureMult;
}

function weatherFactor(input) {
  let f = 1.0;
  if (input.temperature != null) f *= 1 + (input.temperature - 28) * 0.008;
  if (input.rainfall != null) f *= 1 + (input.rainfall - 100) * 0.002;
  if (input.humidity != null) f *= 0.95 + (input.humidity / 100) * 0.1;
  return f;
}

function irrigationFactor(input) {
  return IRRIGATION_FACTOR[input.irrigationType] ?? 1.0;
}

function fertilizerEfficiency(input) {
  return input.fertilizerUsed ? 1.05 : 1.0;
}

function runYieldModel(input) {
  const base = BASE_YIELD_KG_HA[input.cropType] ?? 3500;
  const soil = soilFactor(input);
  const weather = weatherFactor(input);
  const irrigation = irrigationFactor(input);
  const fertilizer = fertilizerEfficiency(input);
  const pestPenalty = input.pestIncidents === "yes" ? 0.88 : 1.0;

  let yield_ = base * soil * weather * irrigation * fertilizer * pestPenalty;
  yield_ = Math.round(Math.max(500, Math.min(12000, yield_)));

  let confidence = 0.75;
  if (input.temperature != null && input.rainfall != null && input.humidity != null) confidence += 0.1;
  if (input.soilType && input.soilMoisture != null) confidence += 0.05;
  if (input.fertilizerUsed && input.irrigationType) confidence += 0.05;
  confidence = Math.min(0.98, Math.round(confidence * 100) / 100);

  let riskLevel = "Low";
  if (yield_ < 2500 || confidence < 0.8 || input.pestIncidents === "yes") riskLevel = yield_ < 2000 ? "High" : "Medium";

  const suggestions = [];
  if (input.pestIncidents === "yes") suggestions.push("Address pest incidents to reduce yield loss; consider integrated pest management.");
  if ((input.soilMoisture ?? 50) < 40) suggestions.push("Increase soil moisture (irrigation) for better crop performance.");
  if (!input.fertilizerUsed) suggestions.push("Apply recommended fertilizer to improve yield potential.");
  if (input.irrigationType === "None" || !input.irrigationType) suggestions.push("Consider drip or sprinkler irrigation for water efficiency.");
  if (confidence < 0.85) suggestions.push("Add more field and weather data for higher prediction confidence.");

  return { yield: yield_, confidenceScore: confidence, riskLevel, suggestedImprovements: suggestions };
}

export async function predictYield(req, res, next) {
  try {
    const body = req.body;
    const input = {
      fieldName: body.fieldName,
      fieldSizeHa: body.fieldSizeHa != null ? parseFloat(body.fieldSizeHa) : null,
      soilType: body.soilType || null,
      soilMoisture: body.soilMoisture != null ? parseFloat(body.soilMoisture) : null,
      cropType: body.cropType || "Rice",
      variety: body.variety || null,
      plantingDate: body.plantingDate || null,
      temperature: body.temperature != null ? parseFloat(body.temperature) : null,
      rainfall: body.rainfall != null ? parseFloat(body.rainfall) : null,
      humidity: body.humidity != null ? parseFloat(body.humidity) : null,
      fertilizerUsed: body.fertilizerUsed === true || body.fertilizerUsed === "true" || body.fertilizerUsed === "yes",
      irrigationType: body.irrigationType || null,
      pestIncidents: body.pestIncidents === true || body.pestIncidents === "yes" ? "yes" : "no",
    };

    if (!input.cropType) {
      return res.status(400).json({ error: "cropType is required" });
    }

    const { yield: predictedYield, confidenceScore, riskLevel, suggestedImprovements } = runYieldModel(input);

    const inputParams = JSON.stringify(input);
    const suggestionsStr = JSON.stringify(suggestedImprovements || []);

    const prediction = await prisma.prediction.create({
      data: {
        userId: req.user.sub,
        fieldId: body.fieldId || null,
        cropType: input.cropType,
        predictedYield: Number(predictedYield),
        unit: "kg/ha",
        status: "completed",
        notes: input.variety ? `Variety: ${input.variety}` : null,
        confidenceScore,
        riskLevel,
        suggestions: suggestionsStr,
        inputParams,
      },
      include: { field: { select: { name: true, location: true } } },
    });

    res.status(201).json({
      ...prediction,
      suggestedImprovements,
    });
  } catch (err) {
    next(err);
  }
}
