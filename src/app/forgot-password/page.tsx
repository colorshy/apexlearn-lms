"use client";

import React, { useState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/actions/auth-actions";
import { useToast } from "@/components/ui/ToastProvider";
import { KeyRound, Mail, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [devResetToken, setDevResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await forgotPasswordAction({ email });
      if (res.success) {
        toast.success(res.message || "Инструкция создана");
        if (res.devResetToken) {
          setDevResetToken(res.devResetToken);
        }
      } else {
        toast.error(res.error || "Ошибка");
      }
    } catch {
      toast.error("Ошибка соединения");
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
            Восстановление пароля
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            Введите ваш email адрес, и мы отправим ссылку для установки нового пароля
          </p>
        </div>

        {devResetToken ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Токен восстановления сгенерирован</span>
            </div>
            <p className="text-xs text-emerald-700">
              В режиме разработки вы можете сразу перейти к установке нового пароля:
            </p>
            <Link
              href={`/reset-password?token=${devResetToken}`}
              className="block w-full py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs text-center shadow-xs hover:bg-emerald-700 transition"
            >
              Перейти к сбросу пароля
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Электронная почта
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="student@apexlearn.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Отправить ссылку для сброса</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100">
          <Link href="/login" className="text-xs font-bold text-blue-600 hover:text-blue-700">
            Вернуться к входу
          </Link>
        </div>
      </div>
    </div>
  );
}
