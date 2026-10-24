"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CourseFormSchema } from "@/lib/validators";
import { createCourseAction } from "@/actions/admin-actions";
import { useToast } from "@/components/ui/ToastProvider";
import { z } from "zod";
import { ChevronLeft, Plus, Loader2, BookOpen } from "lucide-react";

type CourseFormValues = z.infer<typeof CourseFormSchema>;

export default function NewCourseAdminPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(CourseFormSchema),
    defaultValues: {
      title: "",
      shortDescription: "",
      fullDescription: "",
      coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80",
      instructorName: "Александр Волков",
      instructorBio: "Lead Full-Stack Engineer",
      instructorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      estimatedHours: 30,
      price: 4900,
      currency: "USD",
      isPublished: true,
      learningObjectives: JSON.stringify([
        "Архитектура современных веб-приложений",
        "Безопасная аутентификация и платежи",
        "Оптимизация производительности и тестирование",
      ]),
      requirements: JSON.stringify([
        "Базовые знания JavaScript",
        "Понимание основ HTML/CSS",
      ]),
    },
  });

  const onSubmit = async (values: CourseFormValues) => {
    setLoading(true);
    try {
      const res = await createCourseAction(values);
      if (res.success) {
        toast.success("Курс успешно создан!");
        router.push("/admin/courses");
        router.refresh();
      } else {
        toast.error(res.error || "Ошибка сохранения");
      }
    } catch {
      toast.error("Не удалось связаться с сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/admin/courses"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Назад ко всем курсам</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Создание нового образовательного курса
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Заполните метаданные, параметры стоимости и целевые результаты обучения
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Название курса
              </label>
              <input
                type="text"
                {...register("title")}
                placeholder="Full-Stack Web Development Mastery: Next.js & PostgreSQL"
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
              {errors.title && (
                <p className="text-xs text-rose-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Краткое описание (для каталога)
              </label>
              <input
                type="text"
                {...register("shortDescription")}
                placeholder="Комплексный 30-часовой курс от базовых принципов до продакшена"
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
              {errors.shortDescription && (
                <p className="text-xs text-rose-500 mt-1">{errors.shortDescription.message}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Полное описание программы
              </label>
              <textarea
                rows={5}
                {...register("fullDescription")}
                placeholder="Подробный текст программы, целевая аудитория..."
                className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
              {errors.fullDescription && (
                <p className="text-xs text-rose-500 mt-1">{errors.fullDescription.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                URL обложки курса
              </label>
              <input
                type="url"
                {...register("coverImage")}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white font-medium"
              />
              {errors.coverImage && (
                <p className="text-xs text-rose-500 mt-1">{errors.coverImage.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Часов обучения (академических)
              </label>
              <input
                type="number"
                {...register("estimatedHours", { valueAsNumber: true })}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white font-medium"
              />
              {errors.estimatedHours && (
                <p className="text-xs text-rose-500 mt-1">{errors.estimatedHours.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Стоимость (в центах, e.g. 4900 = $49.00)
              </label>
              <input
                type="number"
                {...register("price", { valueAsNumber: true })}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white font-medium"
              />
              {errors.price && (
                <p className="text-xs text-rose-500 mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Имя инструктора
              </label>
              <input
                type="text"
                {...register("instructorName")}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Цели обучения (JSON массив строк)
              </label>
              <textarea
                rows={3}
                {...register("learningObjectives")}
                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Требования (JSON массив строк)
              </label>
              <textarea
                rows={2}
                {...register("requirements")}
                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Link
              href="/admin/courses"
              className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
            >
              Отмена
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>Создать курс</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
