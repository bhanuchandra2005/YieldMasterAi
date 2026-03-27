import { prisma } from "../models/index.js";

export async function list(req, res, next) {
  try {
    const list = await prisma.prediction.findMany({
      where: { userId: req.user.sub },
      orderBy: { createdAt: "desc" },
      include: { field: { select: { name: true, location: true } } },
    });
    res.json(list);
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const { id } = req.params;
    const prediction = await prisma.prediction.findFirst({
      where: { id, userId: req.user.sub },
      include: { field: { select: { name: true, location: true } } },
    });
    if (!prediction) return res.status(404).json({ error: "Prediction not found" });
    res.json(prediction);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.prediction.deleteMany({ where: { id, userId: req.user.sub } });
    res.json({ message: "Prediction deleted" });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { fieldId, cropType, predictedYield, unit, notes } = req.body;
    if (!cropType || predictedYield === undefined) {
      return res.status(400).json({ error: "cropType and predictedYield required" });
    }
    const prediction = await prisma.prediction.create({
      data: {
        userId: req.user.sub,
        fieldId: fieldId || null,
        cropType: cropType || "Rice",
        predictedYield: Number(predictedYield),
        unit: unit || "kg/ha",
        status: "completed",
        notes: notes || null,
      },
      include: { field: { select: { name: true, location: true } } },
    });
    res.status(201).json(prediction);
  } catch (err) {
    next(err);
  }
}
