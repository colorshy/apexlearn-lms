import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getResumeLesson } from "@/lib/progression";
import { EnrollButton } from "@/components/courses/EnrollButton";
import {
  Clock,
  BookOpen,
  CheckCircle2,
  Lock,
  Award,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  FileCheck,
} from "lucide-react";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const currentUser = await getCurrentUser();

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { orderIndex: "asc" },
        include: {
          lessons: { orderBy: { orderIndex: "asc" } },
          quiz: true,
        },
      },
      finalExam: true,
      enrollments: currentUser
        ? {
            where: { userId: currentUser.id },
          }
        : false,
    },
  });

  if (!course) {
    notFound();
  }

  const isEnrolled = currentUser ? (course.enrollments?.length ?? 0) > 0 : false;
  const resumeLesson = currentUser && isEnrolled
    ? await getResumeLesson(course.id, currentUser.id)
    : null;

  let objectives: string[] = [];
  let requirements: string[] = [];
  try {
    objectives = JSON.parse(course.learningObjectives);
  } catch {}
  try {
    requirements = JSON.parse(course.requirements);
  } catch {}

  const totalLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.length,
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-6">
          <a href="/courses" className="hover:text-blue-600 transition">Каталог курсов</a>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-semibold truncate">{course.title}</span>
        </div>

        {/* Hero Banner Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Main info */}
          <div className="lg:col-span-8 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 text-blue-700 text-xs font-bold">
              <span>Интенсивная программа {course.estimatedHours} часов</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {course.title}
            </h1>

            <p className="text-slate-600 text-base leading-relaxed">
              {course.shortDescription}
            </p>

            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-600 border-t border-slate-200/60">
              <div className="flex items-center gap-2">
                <img
                  src={course.instructorAvatar}
                  alt={course.instructorName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20"
                />
                <div>
                  <div className="font-semibold text-slate-900">{course.instructorName}</div>
                  <div className="text-[11px] text-slate-500">{course.instructorBio}</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>{course.estimatedHours} ч. академической нагрузки</span>
              </div>

              <div className="flex items-center gap-1.5 font-medium">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>{course.modules.length} модулей, {totalLessons} уроков</span>
              </div>
            </div>
          </div>

          {/* Sticky Purchase Card */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6 sticky top-24">
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-100">
                <img
                  src={course.coverImage}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Стоимость
                  </span>
                  <span className="text-3xl font-extrabold text-slate-900">
                    ${(course.price / 100).toFixed(2)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Однократная оплата • Бессрочный доступ • Верифицируемый сертификат
                </p>
              </div>

              <EnrollButton
                courseId={course.id}
                isEnrolled={isEnrolled}
                resumeLessonId={resumeLesson?.id}
                slug={course.slug}
                priceFormatted={`$${(course.price / 100).toFixed(2)}`}
                isLoggedIn={!!currentUser}
              />

              <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Строгая последовательность модулей</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Проверочные тесты после каждого модуля</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Финальный экзамен и номерной сертификат</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Гарантия возврата в течение 14 дней</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Description & Curriculum */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-12">
            {/* Learning Objectives */}
            {objectives.length > 0 && (
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-xl font-bold text-slate-900">Что вы изучите на курсе</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {objectives.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full description */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-xl font-bold text-slate-900">Подробное описание программы</h3>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {course.fullDescription}
              </div>
            </div>

            {/* Curriculum Breakdown */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Учебный план</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {course.modules.length} модулей • {totalLessons} уроков • 1 Финальный экзамен
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  Последовательный доступ
                </span>
              </div>

              <div className="space-y-4">
                {course.modules.map((mod, mIdx) => (
                  <div
                    key={mod.id}
                    className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50"
                  >
                    <div className="p-4 sm:p-5 bg-white border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                          {mIdx + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{mod.title}</h4>
                          <p className="text-xs text-slate-500">{mod.description}</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        {mod.lessons.length} уроков
                      </span>
                    </div>

                    <div className="p-3 space-y-1.5">
                      {mod.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-100 text-xs text-slate-700 hover:border-slate-200 transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <BookOpen className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">{lesson.title}</span>
                          </div>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {lesson.durationMinutes} мин
                          </span>
                        </div>
                      ))}

                      {mod.quiz && (
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/60 border border-blue-200/60 text-xs text-blue-900 font-semibold">
                          <div className="flex items-center gap-2.5">
                            <FileCheck className="w-4 h-4 text-blue-600" />
                            <span>{mod.quiz.title}</span>
                          </div>
                          <span className="text-[11px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                            Проходной балл: {mod.quiz.passingScorePercent}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Final Exam Highlight */}
                {course.finalExam && (
                  <div className="border-2 border-purple-200 rounded-2xl p-5 bg-gradient-to-r from-purple-50 to-indigo-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-purple-950">
                          {course.finalExam.title}
                        </h4>
                        <p className="text-xs text-purple-700">
                          Итоговый экзамен для выдачи верифицируемого сертификата
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-purple-800 bg-white px-3 py-1.5 rounded-xl shadow-xs border border-purple-200">
                      Порог {course.finalExam.passingScorePercent}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Requirements */}
            {requirements.length > 0 && (
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-xl font-bold text-slate-900">Предварительные требования</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  {requirements.map((req, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
