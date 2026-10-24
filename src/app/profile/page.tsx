"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileUpdateSchema } from "@/lib/validators";
import { updateProfileAction } from "@/actions/auth-actions";
import { useToast } from "@/components/ui/ToastProvider";
import { z } from "zod";
import { User, Mail, Shield, Save, Loader2, Camera, Calendar } from "lucide-react";

type ProfileFormValues = z.infer<typeof ProfileUpdateSchema>;

export default function ProfileSettingsPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    bio?: string | null;
    avatarUrl?: string | null;
    createdAt?: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileUpdateSchema),
  });

  useEffect(() => {
    // Fetch profile
    fetch("/api/user/me")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setUserData(data);
        reset({
          name: data.name,
          bio: data.bio || "",
          avatarUrl: data.avatarUrl || "",
        });
      })
      .catch(() => {
        // Fallback: router to login
        router.push("/login?redirect=/profile");
      });
  }, [reset, router]);

  const onSubmit = async (values: ProfileFormValues) => {
    setLoading(true);
    try {
      const res = await updateProfileAction(values);
      if (res.success) {
        toast.success("Профиль успешно обновлен!");
        router.refresh();
      } else {
        toast.error(res.error || "Ошибка сохранения");
      }
    } catch {
      toast.error("Не удалось сохранить профиль");
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Профиль и настройки аккаунта
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Управляйте персональной информацией и настройками профиля студента
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left card: Summary */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-6 text-center">
            <div className="relative w-24 h-24 mx-auto">
              {userData.avatarUrl ? (
                <img
                  src={userData.avatarUrl}
                  alt={userData.name}
                  className="w-full h-full rounded-3xl object-cover ring-4 ring-blue-500/20 shadow-md"
                />
              ) : (
                <div className="w-full h-full rounded-3xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-3xl">
                  {userData.name.charAt(0)}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">{userData.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{userData.email}</p>
              <div className="mt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 inline-flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {userData.role}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-2 text-left">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Зарегистрирован: {new Date(userData.createdAt || Date.now()).toLocaleDateString("ru-RU")}</span>
              </div>
            </div>
          </div>

          {/* Right card: Form */}
          <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xs">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Ваше имя
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register("name")}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                {errors.name && (
                  <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email (только чтение)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={userData.email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-xl border border-slate-200 text-sm text-slate-500 font-medium cursor-not-allowed"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  URL аватара
                </label>
                <input
                  type="url"
                  {...register("avatarUrl")}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
                />
                {errors.avatarUrl && (
                  <p className="text-xs text-rose-500 mt-1">{errors.avatarUrl.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  О себе / Профессиональные интересы
                </label>
                <textarea
                  rows={4}
                  {...register("bio")}
                  placeholder="Например: Frontend разработчик, изучаю Next.js и PostgreSQL..."
                  className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium leading-relaxed"
                />
                {errors.bio && (
                  <p className="text-xs text-rose-500 mt-1">{errors.bio.message}</p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Сохранить изменения</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
