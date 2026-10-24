import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCourseProgression, getResumeLesson } from "@/lib/progression";
import {
  BookOpen,
  Clock,
  PlayCircle,
  Award,
  CheckCircle2,
  Calendar,
  ArrowRight,
  TrendingUp,
  FileCheck,
} from "lucide-react";

export default async function StudentDashboardPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login?redirect=/dashboard");
  }

  // Fetch all enrollments for this student
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: currentUser.id },
    orderBy: { enrolledAt: "desc" },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: true,
              quiz: true,
            },
          },
          finalExam: true,
        },
      },
    },
  });

  // Calculate progression and resume lesson for each enrolled course
  const coursesWithProgress = await Promise.all(
    enrollments.map(async (enr) => {
      const progression = await getCourseProgression(enr.courseId, currentUser.id);
      const resumeLesson = await getResumeLesson(enr.courseId, currentUser.id);

      return {
        enrollment: enr,
        course: enr.course,
        progression,
        resumeLesson,
      };
    })
  );

  const inProgressCourses = coursesWithProgress.filter(
    (c) => !c.progression.isCourseCompleted
  );
  const completedCourses = coursesWithProgress.filter(
    (c) => c.progression.isCourseCompleted
  );

  const totalMinutesStudied = Math.round(
    coursesWithProgress.reduce(
      (sum, c) => sum + c.progression.totalTimeSpentSeconds,
      0
    ) / 60
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-4">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl">
                {currentUser.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Личный кабинет: {currentUser.name}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {currentUser.email} • Роль: {currentUser.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 self-start sm:self-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
            <div className="text-center sm:text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Активное время
              </span>
              <span className="text-xl font-bold text-slate-900 flex items-center gap-1 justify-center sm:justify-end">
                <Clock className="w-4 h-4 text-blue-600" />
                {totalMinutesStudied} мин
              </span>
            </div>

            <div className="text-center sm:text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Курсов в процессе
              </span>
              <span className="text-xl font-bold text-slate-900 flex items-center gap-1 justify-center sm:justify-end">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                {inProgressCourses.length}
              </span>
            </div>
          </div>
        </div>

        {/* In Progress Courses */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-blue-600" />
              <span>Текущие курсы ({inProgressCourses.length})</span>
            </h2>
            <Link
              href="/courses"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Каталог <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {inProgressCourses.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto space-y-4">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">
                У вас пока нет активных курсов
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Запишитесь на флагманский курс и начните освоение веб-технологий пошагово!
              </p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
              >
                <span>Выбрать курс в каталоге</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {inProgressCourses.map(({ course, progression, resumeLesson }) => {
                const completedModulesCount = progression.modules.filter(
                  (m) => m.isCompleted
                ).length;

                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex gap-4 items-start">
                        <img
                          src={course.coverImage}
                          alt={course.title}
                          className="w-24 h-20 rounded-2xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mb-1">
                            В процессе изучения
                          </span>
                          <h3 className="text-base font-bold text-slate-900 truncate">
                            {course.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Преподаватель: {course.instructorName}
                          </p>
                        </div>
                      </div>

                      {/* Progress meter */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-600">
                            Пройдено {progression.completedLessons} из {progression.totalLessons} уроков ({completedModulesCount} мод.)
                          </span>
                          <span className="text-blue-600 font-bold">
                            {progression.progressPercent}%
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                            style={{ width: `${progression.progressPercent}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Stats pill row */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-600">
                          <span className="block text-[10px] text-slate-400 font-bold uppercase">Текущий урок:</span>
                          <span className="font-semibold text-slate-800 truncate block">
                            {resumeLesson?.title || "Модуль 1"}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-600">
                          <span className="block text-[10px] text-slate-400 font-bold uppercase">Время на курсе:</span>
                          <span className="font-semibold text-slate-800">
                            {Math.round(progression.totalTimeSpentSeconds / 60)} мин.
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        href={`/courses/${course.slug}`}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                      >
                        О курсе
                      </Link>

                      {resumeLesson ? (
                        <Link
                          href={`/learn/${course.slug}/lesson/${resumeLesson.id}`}
                          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2"
                        >
                          <PlayCircle className="w-4 h-4" />
                          <span>Продолжить обучение</span>
                        </Link>
                      ) : (
                        <Link
                          href={`/courses/${course.slug}`}
                          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2"
                        >
                          <span>К первому уроку</span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Courses Section */}
        {completedCourses.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <span>Завершенные курсы и сертификаты ({completedCourses.length})</span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {completedCourses.map(({ course, progression }) => (
                <div
                  key={course.id}
                  className="bg-white rounded-3xl border border-emerald-200/80 p-6 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                      <img
                        src={course.coverImage}
                        alt={course.title}
                        className="w-24 h-20 rounded-2xl object-cover shrink-0"
                      />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mb-1">
                          Курс успешно завершен
                        </span>
                        <h3 className="text-base font-bold text-slate-900">
                          {course.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Сертификат № {progression.completionData?.certificateNumber || "Верифицирован"}
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-emerald-800 font-semibold block">Итоговый экзамен</span>
                        <span className="text-emerald-600 text-[11px]">
                          Балл: {progression.completionData?.finalExamScore ?? 100}%
                        </span>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/learn/${course.slug}/completed`}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                    >
                      <Award className="w-4 h-4" />
                      <span>Посмотреть сертификат</span>
                    </Link>
                    <Link
                      href={`/courses/${course.slug}`}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      Материалы курса
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
