import { prisma } from "../models/index.js";
import { updateProfileSchema } from "../utils/validators.js";

function sanitizeUser(user) {
  if (!user) return null;
  const { password, resetPasswordToken, resetPasswordExpires, verificationToken, ...rest } = user;
  return rest;
}

export async function getProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
      include: {
        notifications: { take: 10, orderBy: { createdAt: "desc" } },
      },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ ...sanitizeUser(user), plan: "free" });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }
    const user = await prisma.user.update({
      where: { id: req.user.sub },
      data: parsed.data,
    });
    
    // Log the update activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.sub,
        action: "updated_profile",
        details: "User updated their profile information.",
      }
    });

    res.json({ ...sanitizeUser(user), plan: "free" });
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req, res, next) {
  try {
    const userId = req.user.sub;
    
    await prisma.activityLog.create({
      data: {
        userId,
        action: "deleted_account",
        details: "User initiated account deletion",
      }
    });

    // Delete user (ActivityLog should cascade if configured, adjust if needed)
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    next(err);
  }
}

export async function getActivityLogs(req, res, next) {
  try {
    const logs = await prisma.activityLog.findMany({
      where: { userId: req.user.sub },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json(logs);
  } catch (err) {
    next(err);
  }
}
