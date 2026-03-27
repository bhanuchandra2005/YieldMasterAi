import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

export const usersRouter = Router();
usersRouter.use(requireAuth);

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  location: z.string().optional(),
});

usersRouter.get("/me", async (req, res) => {
  const user = (req as any).user;
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    location: user.location,
    avatarUrl: user.avatarUrl,
    plan: user.plan,
    createdAt: user.createdAt,
    settings: user.settings,
  });
});

usersRouter.patch("/me", async (req, res) => {
  try {
    const user = (req as any).user;
    const body = updateProfileSchema.parse(req.body);
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(body.name != null && { name: body.name }),
        ...(body.location != null && { location: body.location }),
      },
      select: { id: true, email: true, name: true, location: true, avatarUrl: true, plan: true, createdAt: true },
    });
    res.json(updated);
  } catch (e) {
    if (e instanceof z.ZodError) {
      res.status(400).json({ error: e.errors[0]?.message ?? "Invalid input" });
      return;
    }
    res.status(500).json({ error: "Update failed" });
  }
});
