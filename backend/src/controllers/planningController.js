import { prisma } from "../models/index.js";

export async function list(req, res, next) {
  try {
    const list = await prisma.planningTask.findMany({
      where: { userId: req.user.sub },
      orderBy: { dueDate: "asc" },
    });
    res.json(list);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { title, type, dueDate } = req.body;
    if (!title || !type || !dueDate) {
      return res.status(400).json({ error: "title, type, and dueDate required" });
    }
    const task = await prisma.planningTask.create({
      data: {
        userId: req.user.sub,
        title,
        type: type || "planting",
        dueDate: new Date(dueDate),
      },
    });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

export async function toggleComplete(req, res, next) {
  try {
    const { id } = req.params;
    const task = await prisma.planningTask.findFirst({
      where: { id, userId: req.user.sub },
    });
    if (!task) return res.status(404).json({ error: "Task not found" });
    const updated = await prisma.planningTask.update({
      where: { id },
      data: { completed: !task.completed },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.planningTask.deleteMany({
      where: { id, userId: req.user.sub },
    });
    res.json({ message: "Task deleted" });
  } catch (err) {
    next(err);
  }
}
