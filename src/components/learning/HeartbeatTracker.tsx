"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { heartbeatAction, completeLessonAction } from "@/actions/learning-actions";
import { useToast } from "@/components/ui/ToastProvider";
import { CheckCircle2, Clock, Loader2, Play, Sparkles } from "lucide-react";

interface HeartbeatTrackerProps {
  lessonId: string;
  initialSecondsSpent: number;
  minRequiredSeconds: number;
  isInitiallyCompleted: boolean;
  nextLessonUrl?: string | null;
}

export function HeartbeatTracker({
  lessonId,
  initialSecondsSpent,
  minRequiredSeconds,
  isInitiallyCompleted,
  nextLessonUrl,
}: HeartbeatTrackerProps) {
  const router = useRouter();
  const toast = useToast();

  const [secondsSpent, setSecondsSpent] = useState(initialSecondsSpent);
  const [isCompleted, setIsCompleted] = useState(isInitiallyCompleted);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const lastActivityTime = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Activity listeners to detect idle users
  const handleUserActivity = useCallback(() => {
    lastActivityTime.current = Date.now();
    if (!isActive) setIsActive(true);
  }, [isActive]);

  useEffect(() => {
    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("scroll", handleUserActivity);
    window.addEventListener("click", handleUserActivity);

    // 1-second UI local ticker
    timerRef.current = setInterval(() => {
      // Inactivity timeout: stop counting if user idle for > 60 seconds
      if (Date.now() - lastActivityTime.current < 60000) {
        setSecondsSpent((prev) => prev + 1);
      } else {
        setIsActive(false);
      }
    }, 1000);

    // Periodic 30-second Heartbeat to server
    heartbeatIntervalRef.current = setInterval(async () => {
      if (Date.now() - lastActivityTime.current < 60000) {
        try {
          const res = await heartbeatAction({
            lessonId,
            deltaSeconds: 30,
          });
          if (res.success && res.data) {
            setSecondsSpent(res.data.secondsSpent);
            if (res.data.isCompleted) {
              setIsCompleted(true);
            }
          }
        } catch {
          // silently ignore transient network blips
        }
      }
    }, 30000);

    return () => {
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
      window.removeEventListener("click", handleUserActivity);
      if (timerRef.current) clearInterval(timerRef.current);
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    };
  }, [lessonId, handleUserActivity]);

  const handleMarkComplete = async () => {
    if (secondsSpent < minRequiredSeconds) {
      toast.info(
        `Минимальное время для усвоения урока: ${minRequiredSeconds} сек. Осталось: ${
          minRequiredSeconds - secondsSpent
        } сек.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await completeLessonAction(lessonId);
      if (res.success) {
        setIsCompleted(true);
        toast.success("Урок успешно завершен!");
        if (nextLessonUrl) {
          router.push(nextLessonUrl);
        } else {
          router.refresh();
        }
      } else {
        toast.error(res.reason || "Ошибка при сохранении прогресса");
      }
    } catch {
      toast.error("Не удалось связаться с сервером");
    } finally {
      setIsSubmitting(false);
    }
  };

  const minutes = Math.floor(secondsSpent / 60);
  const seconds = secondsSpent % 60;
  const progressToMin = Math.min(100, Math.round((secondsSpent / minRequiredSeconds) * 100));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Time display */}
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isCompleted
              ? "bg-emerald-100 text-emerald-700"
              : isActive
              ? "bg-blue-100 text-blue-700"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">
              Время на уроке: {minutes}м {seconds < 10 ? `0${seconds}` : seconds}с
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
              }`}
              title={isActive ? "Активность подтверждена" : "Неактивен"}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            {secondsSpent >= minRequiredSeconds
              ? "Требуемое время выполнено ✓"
              : `Необходимо изучать минимум ${minRequiredSeconds} сек. (${progressToMin}%)`}
          </p>
        </div>
      </div>

      {/* Action button */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {isCompleted ? (
          <div className="w-full sm:w-auto flex items-center gap-2">
            <span className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Урок пройден</span>
            </span>
            {nextLessonUrl && (
              <button
                onClick={() => router.push(nextLessonUrl)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
              >
                <span>Следующий урок</span>
                <Play className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={handleMarkComplete}
            disabled={isSubmitting || secondsSpent < minRequiredSeconds}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 ${
              secondsSpent >= minRequiredSeconds
                ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Завершить урок</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
