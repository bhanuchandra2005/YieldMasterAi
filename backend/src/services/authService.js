import bcrypt from "bcrypt";
import { prisma } from "../models/index.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import crypto from "crypto";

const SALT_ROUNDS = 10;

export async function signup({ name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error("Email already in use");
    err.status = 400;
    throw err;
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const verificationToken = crypto.randomUUID();

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      verificationToken,
    },
  });

  // TODO: send verification email with token

  const tokens = generateTokens(user);
  return { user: sanitizeUser(user), ...tokens };
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  const tokens = generateTokens(user);
  return { user: sanitizeUser(user), ...tokens };
}

export async function verifyEmail(token) {
  const user = await prisma.user.findFirst({ where: { verificationToken: token } });
  if (!user) {
    const err = new Error("Invalid or expired verification token");
    err.status = 400;
    throw err;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verificationToken: null },
  });

  return { success: true };
}

export async function requestPasswordReset(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { success: true };
  }

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 1000 * 60 * 60);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    },
  });

  // TODO: send reset email

  return { success: true };
}

export async function resetPassword(token, newPassword) {
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { gt: new Date() },
    },
  });

  if (!user) {
    const err = new Error("Invalid or expired reset token");
    err.status = 400;
    throw err;
  }

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashed,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

  return { success: true };
}

export async function refreshToken(refreshTokenValue) {
  const payload = verifyRefreshToken(refreshTokenValue);
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    const err = new Error("User not found");
    err.status = 401;
    throw err;
  }
  return generateTokens(user);
}

export function generateTokens(user) {
  const payload = { sub: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  return { accessToken, refreshToken };
}

function sanitizeUser(user) {
  const { password, resetPasswordToken, resetPasswordExpires, verificationToken, ...rest } = user;
  return rest;
}

