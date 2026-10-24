"use server";

import prisma from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  setAuthCookie,
  removeAuthCookie,
  getCurrentUser,
  requireAuth,
} from "@/lib/auth";
import {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ProfileUpdateSchema,
} from "@/lib/validators";
import crypto from "crypto";

export async function registerAction(data: unknown) {
  const parsed = RegisterSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Неверные данные",
    };
  }

  const { name, email, password } = parsed.data;

  // Check existing user
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    return {
      success: false,
      error: "Пользователь с таким email уже зарегистрирован",
    };
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: "STUDENT",
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    },
  });

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role as "STUDENT" | "ADMIN",
  });

  await setAuthCookie(token);

  return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}

export async function loginAction(data: unknown) {
  const parsed = LoginSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Заполните все поля",
    };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return {
      success: false,
      error: "Неверный email или пароль",
    };
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return {
      success: false,
      error: "Неверный email или пароль",
    };
  }

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role as "STUDENT" | "ADMIN",
  });

  await setAuthCookie(token);

  return {
    success: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

export async function logoutAction() {
  await removeAuthCookie();
  return { success: true };
}

export async function forgotPasswordAction(data: unknown) {
  const parsed = ForgotPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Укажите корректный email" };
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    // Return success to avoid email enumeration attack
    return {
      success: true,
      message: "Если аккаунт существует, инструкция по сбросу сгенерирована",
    };
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  return {
    success: true,
    message: "Ссылка на сброс пароля создана",
    // In dev mode, return the token for immediate testing!
    devResetToken: rawToken,
  };
}

export async function resetPasswordAction(data: unknown) {
  const parsed = ResetPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Неверные данные" };
  }

  const { token, password } = parsed.data;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const resetRecord = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!resetRecord) {
    return {
      success: false,
      error: "Срок действия ссылки истек или токен недействителен",
    };
  }

  const newHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash: newHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { success: true, message: "Пароль успешно обновлен. Теперь вы можете войти." };
}

export async function updateProfileAction(data: unknown) {
  const user = await requireAuth();

  const parsed = ProfileUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      bio: parsed.data.bio,
      avatarUrl: parsed.data.avatarUrl || user.avatarUrl,
    },
  });

  return { success: true, user: updated };
}
