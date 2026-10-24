"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema } from "@/lib/validators";
import { registerAction } from "@/actions/auth-actions";
import { useToast } from "@/components/ui/ToastProvider";
import { z } from "zod";
import { GraduationCap, ArrowRight, Loader2, Lock, Mail, User } from "lucide-react";

type RegisterFormValues = z.infer<typeof RegisterSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      const res = await registerAction(values);
      if (res.success) {
        toast.success("Регистрация успешна! Добро пожаловать.");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(res.error || "Ошибка регистрации");
      }
    } catch {
      toast.error("Не удалось связаться с сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/20 mb-3">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Создать аккаунт студента
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            Присоединяйтесь к тысячам инженеров и начните обучение
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Ваше имя и фамилия
            </label>
            <div className="relative">
              <input
                type="text"
                {...register("name")}
                placeholder="Иван Петров"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            {errors.name && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Электронная почта
            </label>
            <div className="relative">
              <input
                type="email"
                {...register("email")}
                placeholder="ivan@example.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Пароль (минимум 6 символов)
            </label>
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
            className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Зарегистрироваться</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Уже есть учетная запись?{" "}
            <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700 underline">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
