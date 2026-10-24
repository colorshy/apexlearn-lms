import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCourseProgression } from "@/lib/progression";
import {
  BookOpen,
  CheckCircle2,
  Lock,
  PlayCircle,
  Award,
  ChevronLeft,
  GraduationCap,
  FileCheck,
  Check,
} from "lucide-react";

export default async function CourseLearningLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(`/login?redirect=/learn/${slug}`);
  }

  const course = await prisma.course.findUnique({
    where: { slug },
  });

  if (!course) notFound();

  const progression = await getCourseProgression(course.id, currentUser.id);

  if (!progression.isEnrolled) {
    redirect(`/courses/${slug}`);
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50">
      {/* Course Sidebar */}
      <aside className="w-full md:w-80 lg:w-96 bg-white border-r border-slate-200/90 flex flex-col shrink-0">
        {/* Course Info Header */}
        <div className="p-5 border-b border-slate-200/90 space-y-3 bg-slate-50/50">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>В личный кабинет</span>
          </Link>

          <div>
            <h2 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
              {course.title}
            </h2>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mt-2">
              <span>Прогресс курса</span>
              <span className="text-blue-600 font-bold">{progression.progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-1.5">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all"
                style={{ width: `${progression.progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Modules & Lessons Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-14rem)]">
          {progression.modules.map((mod, idx) => (
            <div
              key={mod.moduleId}
              className={`rounded-2xl border transition-all ${
                mod.isUnlocked
                  ? "bg-white border-slate-200 shadow-2xs"
                  : "bg-slate-50/80 border-slate-200/60 opacity-60"
              }`}
            >
              {/* Module Header */}
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center ${
                      mod.isCompleted
                        ? "bg-emerald-100 text-emerald-800"
                        : mod.isUnlocked
                        ? "bg-blue-100 text-blue-800"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 truncate max-w-[190px]">
                    {mod.title}
                  </h4>
                </div>

                {mod.isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : !mod.isUnlocked ? (
                  <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                ) : null}
              </div>

              {/* Lessons List */}
              <div className="p-2 space-y-1">
                {mod.lessons.map((lesson) => (
                  <div key={lesson.id}>
                    {mod.isUnlocked ? (
                      <Link
                        href={`/learn/${slug}/lesson/${lesson.id}`}
                        className="flex items-center justify-between p-2 rounded-xl text-xs hover:bg-slate-100/80 transition group"
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          {lesson.isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <PlayCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                          )}
                          <span
                            className={`truncate ${
                              lesson.isCompleted
                                ? "text-slate-600"
                                : "text-slate-800 font-medium"
                            }`}
                          >
                            {lesson.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {lesson.durationMinutes}м
                        </span>
                      </Link>
                    ) : (
                      <div className="flex items-center justify-between p-2 text-xs text-slate-400 cursor-not-allowed">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <Lock className="w-3 h-3 text-slate-300 shrink-0" />
                          <span className="truncate">{lesson.title}</span>
                        </div>
                        <span className="text-[10px] font-mono">{lesson.durationMinutes}м</span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Module Quiz */}
                {mod.quiz && (
                  <div className="pt-1 mt-1 border-t border-slate-100">
                    {mod.quiz.isUnlocked ? (
                      <Link
                        href={`/learn/${slug}/quiz/${mod.quiz.id}`}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition ${
                          mod.quiz.isPassed
                            ? "bg-emerald-50/70 text-emerald-900 border border-emerald-100"
                            : "bg-blue-50/70 text-blue-900 border border-blue-100 hover:bg-blue-100/70"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">Тест: {mod.quiz.title}</span>
                        </div>
                        {mod.quiz.isPassed ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            {mod.quiz.bestScore}%
                          </span>
                        ) : (
                          <span className="text-[10px] text-blue-700 underline">Сдать</span>
                        )}
                      </Link>
                    ) : (
                      <div className="flex items-center justify-between p-2 text-xs text-slate-400 bg-slate-50 rounded-xl cursor-not-allowed">
                        <div className="flex items-center gap-2 min-w-0">
                          <Lock className="w-3 h-3 text-slate-300 shrink-0" />
                          <span className="truncate">Тест модуля (заблокирован)</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Final Exam Section */}
          {progression.finalExam && (
            <div
              className={`rounded-2xl border p-3.5 transition-all ${
                progression.finalExam.isUnlocked
                  ? "bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200"
                  : "bg-slate-50 border-slate-200 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Award
                    className={`w-5 h-5 ${
                      progression.finalExam.isPassed
                        ? "text-emerald-600"
                        : progression.finalExam.isUnlocked
                        ? "text-purple-600"
                        : "text-slate-400"
                    }`}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Итоговый сертификационный экзамен
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      {progression.finalExam.isPassed
                        ? `Сдан на ${progression.finalExam.bestScore}% ✓`
                        : `Порог прохождения: ${progression.finalExam.passingScorePercent}%`}
                    </p>
                  </div>
                </div>

                {progression.finalExam.isUnlocked ? (
                  progression.finalExam.isPassed ? (
                    <Link
                      href={`/learn/${slug}/completed`}
                      className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold"
                    >
                      Сертификат
                    </Link>
                  ) : (
                    <Link
                      href={`/learn/${slug}/exam/${progression.finalExam.id}`}
                      className="px-2.5 py-1 bg-purple-600 text-white rounded-lg text-[10px] font-bold hover:bg-purple-700"
                    >
                      Сдать
                    </Link>
                  )
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
