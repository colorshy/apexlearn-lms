"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPasswordAction } from "@/actions/auth-actions";
import { useToast } from "@/components/ui/ToastProvider";
import { KeyRound, Lock, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const toast = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Токен сброса пароля отсутствует или недействителен");
      return;
    }
    if (password.length < 6) {
      toast.error("Пароль должен содержать не менее 6 символов");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Пароли не совпадают");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordAction({ token, password });
      if (res.success) {
        setIsSuccess(true);
        toast.success(res.message || "Пароль успешно обновлен");
        setTimeout(() => router.push("/login"), 2500);
      } else {
        toast.error(res.error || "Ошибка сброса пароля");
      }
    } catch {
      toast.error("Не удалось связаться с сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Установка нового пароля
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            Придумайте новый надежный пароль для вашей учетной записи
          </p>
        </div>

        {isSuccess ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-slate-900">Пароль успешно изменен!</h3>
            <p className="text-xs text-slate-600">
              Вы будете автоматически перенаправлены на страницу входа через пару секунд...
            </p>
            <Link
              href="/login"
              className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              Войти сейчас
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Новый пароль
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Повторите новый пароль
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Сохранить новый пароль</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100">
          <Link href="/login" className="text-xs font-bold text-blue-600 hover:text-blue-700">
            Вернуться ко входу
          </Link>
        </div>
      </div>
    </div>
  );
}
