"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@/lib/validators";
import { loginAction } from "@/actions/auth-actions";
import { useToast } from "@/components/ui/ToastProvider";
import { z } from "zod";
import { GraduationCap, ArrowRight, Loader2, Lock, Mail, ShieldCheck, User } from "lucide-react";

type LoginFormValues = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const res = await loginAction(values);
      if (res.success) {
        toast.success(`С возвращением, ${res.user?.name}!`);
        if (res.user?.role === "ADMIN" && redirectUrl === "/dashboard") {
          router.push("/admin");
        } else {
          router.push(redirectUrl);
        }
        router.refresh();
      } else {
        toast.error(res.error || "Неверный логин или пароль");
      }
    } catch {
      toast.error("Не удалось связаться с сервером");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (email: string, pass: string) => {
    setValue("email", email);
    setValue("password", pass);
    onSubmit({ email, password: pass });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/20 mb-3">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Вход в ApexLearn
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            Введите данные для входа в ваш личный кабинет
          </p>
        </div>

        {/* Demo Fast Logins for reviewers */}
        <div className="bg-blue-50/70 border border-blue-200/60 rounded-2xl p-3.5 space-y-2">
          <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block text-center">
            Быстрый вход для проверки (1 клик):
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("student@apexlearn.com", "student123456")}
              className="py-2 px-2.5 rounded-xl bg-white border border-blue-200 text-blue-700 hover:bg-blue-100/50 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs"
            >
              <User className="w-3.5 h-3.5" />
              <span>Студент</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("admin@apexlearn.com", "admin123456")}
              className="py-2 px-2.5 rounded-xl bg-amber-500 text-white hover:bg-amber-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Администратор</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Электронная почта
            </label>
            <div className="relative">
              <input
                type="email"
                {...register("email")}
                placeholder="student@apexlearn.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">Пароль</label>
              <Link
                href="/forgot-password"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Забыли пароль?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                {...register("password")}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            {errors.password && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Войти в аккаунт</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Еще нет аккаунта?{" "}
            <Link
              href="/register"
              className="font-bold text-blue-600 hover:text-blue-700 underline"
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
