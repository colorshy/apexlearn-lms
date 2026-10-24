import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { assertCanAccessLesson } from "@/lib/progression";
import { HeartbeatTracker } from "@/components/learning/HeartbeatTracker";
import {
  Lock,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileText,
  ExternalLink,
  Download,
  AlertTriangle,
} from "lucide-react";

export default async function LessonLearningPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(`/login?redirect=/learn/${slug}/lesson/${lessonId}`);
  }

  // Check server-side access to lesson
  const access = await assertCanAccessLesson(lessonId, currentUser.id);

  if (!access.allowed) {
    return (
      <div className="bg-white rounded-3xl border border-rose-200 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Доступ к уроку ограничен</h2>
        <p className="text-sm text-slate-600 leading-relaxed">{access.reason}</p>
        <div className="pt-4">
          <Link
            href={`/dashboard`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
          >
            <span>Вернуться в дашборд</span>
          </Link>
        </div>
      </div>
    );
  }

  const { lesson, progression } = access;
  if (!lesson) notFound();

  // Fetch student progress for this lesson
  const userProgress = await prisma.lessonProgress.findUnique({
    where: {
      userId_lessonId: { userId: currentUser.id, lessonId },
    },
  });

  // Find previous and next lessons in the current module or adjacent modules
  const currentModule = progression?.modules.find((m) => m.moduleId === lesson.moduleId);
  const currentLessons = currentModule?.lessons || [];
  const currentIndex = currentLessons.findIndex((l) => l.id === lesson.id);

  const prevLesson = currentIndex > 0 ? currentLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < currentLessons.length - 1 ? currentLessons[currentIndex + 1] : null;

  let resources: { title: string; url: string; type?: string }[] = [];
  try {
    if (lesson.resources) {
      resources = JSON.parse(lesson.resources);
    }
  } catch {}

  const nextLessonUrl = nextLesson
    ? `/learn/${slug}/lesson/${nextLesson.id}`
    : currentModule?.quiz && currentModule.quiz.isUnlocked
    ? `/learn/${slug}/quiz/${currentModule.quiz.id}`
    : null;

  return (
    <div className="space-y-8 pb-16">
      {/* Lesson Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
          <BookOpen className="w-4 h-4" />
          <span>{currentModule?.title}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {lesson.title}
        </h1>
      </div>

      {/* Video Player (if present) */}
      {lesson.videoUrl && (
        <div className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-xl aspect-video relative">
          <video
            controls
            playsInline
            className="w-full h-full object-contain"
            src={lesson.videoUrl}
            poster="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80"
          >
            Ваш браузер не поддерживает встроенное видео.
          </video>
        </div>
      )}

      {/* Real-time Heartbeat Tracker Bar */}
      <HeartbeatTracker
        lessonId={lesson.id}
        initialSecondsSpent={userProgress?.secondsSpent || 0}
        minRequiredSeconds={lesson.minRequiredSeconds}
        isInitiallyCompleted={userProgress?.isCompleted || false}
        nextLessonUrl={nextLessonUrl}
      />

      {/* Lesson Rich Content */}
      <article className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs prose prose-slate max-w-none">
        <div className="text-sm sm:text-base text-slate-800 leading-relaxed whitespace-pre-line space-y-4 font-normal">
          {lesson.content}
        </div>
      </article>

      {/* Downloadable / External Resources */}
      {resources.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Материалы и полезные ссылки к уроку</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {resources.map((res, i) => (
              <a
                key={i}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-200 transition text-xs font-semibold text-slate-800 group"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
                  <span className="truncate">{res.title}</span>
                </div>
                <span className="text-[10px] text-blue-600 font-bold shrink-0 ml-2">Открыть ↗</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        {prevLesson ? (
          <Link
            href={`/learn/${slug}/lesson/${prevLesson.id}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Предыдущий урок</span>
          </Link>
        ) : (
          <div></div>
        )}

        {nextLesson ? (
          <Link
            href={`/learn/${slug}/lesson/${nextLesson.id}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
          >
            <span>Следующий урок</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : currentModule?.quiz ? (
          <Link
            href={`/learn/${slug}/quiz/${currentModule.quiz.id}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition"
          >
            <span>Перейти к тесту модуля</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
