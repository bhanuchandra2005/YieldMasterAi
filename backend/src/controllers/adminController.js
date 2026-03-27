import { prisma } from "../models/index.js";

function sanitizeUser(user) {
  const { password, resetPasswordToken, resetPasswordExpires, verificationToken, ...rest } = user;
  return rest;
}

export async function listUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ message: "User deleted" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "User not found" });
    next(err);
  }
}

export async function analytics(req, res, next) {
  try {
    const [userCount, paymentSum] = await Promise.all([
      prisma.user.count(),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "succeeded" } }),
    ]);
    res.json({
      userCount,
      totalRevenue: paymentSum._sum.amount ?? 0,
    });
  } catch (err) {
    next(err);
  }
}
