import bcrypt from "bcrypt";
import { prisma } from "../models/index.js";
import * as authService from "../services/authService.js";
import { signupSchema, loginSchema, changePasswordSchema } from "../utils/validators.js";

export async function signup(req, res, next) {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }
    const { name, email, password } = parsed.data;
    const result = await authService.signup({ name, email, password });
    const user = { ...result.user, plan: result.user.plan ?? "free" };
    res.status(201).json({
      user,
      token: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }
    const { email, password } = parsed.data;
    const result = await authService.login({ email, password });
    const user = { ...result.user, plan: result.user.plan ?? "free" };
    res.json({
      user,
      token: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  res.json({ message: "Logged out" });
}

export async function refreshToken(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: "Refresh token required" });
    const result = await authService.refreshToken(refreshToken);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });
    await authService.requestPasswordReset(email);
    res.json({ message: "If an account exists, a reset link was sent." });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: "Token and newPassword required" });
    await authService.resetPassword(token, newPassword);
    res.json({ message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "Token required" });
    await authService.verifyEmail(token);
    res.json({ message: "Email verified" });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }
    
    const { oldPassword, newPassword } = parsed.data;
    const userId = req.user.sub;
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ error: "Incorrect old password" });
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
    
    await prisma.activityLog.create({
      data: {
        userId,
        action: "changed_password",
        details: "User changed their password"
      }
    });
    
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
}
