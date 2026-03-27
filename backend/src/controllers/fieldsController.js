import { prisma } from "../models/index.js";

export async function list(req, res, next) {
  try {
    const list = await prisma.field.findMany({
      where: { userId: req.user.sub },
      orderBy: { createdAt: "desc" },
    });
    res.json(list);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { name, area, location, cropType } = req.body;
    if (!name || !area || !location) {
      return res.status(400).json({ error: "name, area, and location required" });
    }
    const field = await prisma.field.create({
      data: {
        userId: req.user.sub,
        name,
        area: String(area),
        location,
        cropType: cropType || "Rice",
      },
    });
    res.status(201).json(field);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.field.deleteMany({
      where: { id, userId: req.user.sub },
    });
    res.json({ message: "Field deleted" });
  } catch (err) {
    next(err);
  }
}
