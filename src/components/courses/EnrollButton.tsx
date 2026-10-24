"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { buyCourseAction } from "@/actions/learning-actions";
import { useToast } from "@/components/ui/ToastProvider";
import { ArrowRight, Loader2, PlayCircle, ShoppingCart } from "lucide-react";

interface EnrollButtonProps {
  courseId: string;
  isEnrolled: boolean;
  resumeLessonId?: string | null;
  slug: string;
  priceFormatted: string;
  isLoggedIn: boolean;
}

export function EnrollButton({
  courseId,
  isEnrolled,
  resumeLessonId,
  slug,
  priceFormatted,
  isLoggedIn,
}: EnrollButtonProps) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (!isLoggedIn) {
      toast.info("Для записи на курс необходимо войти или зарегистрироваться");
      router.push(`/login?redirect=/courses/${slug}`);
      return;
    }

    if (isEnrolled) {
      if (resumeLessonId) {
        router.push(`/learn/${slug}/lesson/${resumeLessonId}`);
      } else {
        router.push(`/dashboard`);
      }
      return;
    }

    setLoading(true);
    try {
      const res = await buyCourseAction(courseId);
      if (res.success && res.orderId) {
        router.push(`/checkout/${res.orderId}`);
      } else if (res.alreadyEnrolled) {
        toast.info("Вы уже записаны на этот курс!");
        router.push(`/dashboard`);
      } else {
        toast.error(res.error || "Ошибка при оформлении заказа");
      }
    } catch {
      toast.error("Не удалось связаться с сервером");
    } finally {
      setLoading(false);
    }
  };

  if (isEnrolled) {
    return (
      <button
        onClick={handleAction}
        className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
      >
        <PlayCircle className="w-5 h-5" />
        <span>Продолжить обучение</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleAction}
      disabled={loading}
      className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 group cursor-pointer"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <ShoppingCart className="w-5 h-5" />
          <span>Записаться за {priceFormatted}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </>
      )}
    </button>
  );
}
