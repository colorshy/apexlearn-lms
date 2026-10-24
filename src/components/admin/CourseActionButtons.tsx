"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleCoursePublishAction, deleteCourseAction } from "@/actions/admin-actions";
import { useToast } from "@/components/ui/ToastProvider";
import { Eye, EyeOff, Trash2, Loader2 } from "lucide-react";

export function CourseActionButtons({
  courseId,
  isPublished,
}: {
  courseId: string;
  isPublished: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await toggleCoursePublishAction(courseId);
      if (res.success) {
        toast.success(
          res.isPublished ? "Курс опубликован в каталоге" : "Курс снят с публикации"
        );
        router.refresh();
      } else {
        toast.error(res.error || "Ошибка");
      }
    } catch {
      toast.error("Ошибка связи с сервером");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить этот курс и все связанные уроки?")) {
      return;
    }
    setLoading(true);
    try {
      const res = await deleteCourseAction(courseId);
      if (res.success) {
        toast.success("Курс успешно удален");
        router.refresh();
      } else {
        toast.error(res.error || "Ошибка удаления");
      }
    } catch {
      toast.error("Ошибка связи с сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        disabled={loading}
        title={isPublished ? "Снять с публикации" : "Опубликовать"}
        className={`p-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
          isPublished
            ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
        }`}
      >
        {isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>

      <button
        onClick={handleDelete}
        disabled={loading}
        title="Удалить курс"
        className="p-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
