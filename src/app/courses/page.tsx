import Link from "next/link";
import prisma from "@/lib/prisma";
import { BookOpen, Clock, Users, Flame, Search, ArrowRight, Check } from "lucide-react";

export default async function CoursesCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; duration?: string }>;
}) {
  const params = await searchParams;
  const searchQuery = params.q?.trim() || "";

  const courses = await prisma.course.findMany({
    where: {
      isPublished: true,
      ...(searchQuery
        ? {
            OR: [
              { title: { contains: searchQuery } },
              { shortDescription: { contains: searchQuery } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      modules: {
        include: {
          lessons: { select: { id: true } },
        },
      },
      finalExam: { select: { id: true } },
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <span className="text-blue-600 font-bold text-xs uppercase tracking-wider">
            Каталог программ
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
            Все курсы платформы
          </h1>
          <p className="text-slate-600 text-sm mt-3 leading-relaxed">
            Выберите направление обучения. Каждый курс включает глубокую теоретическую базу,
            интерактивные задания, проверку квизами и итоговую сертификацию.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-12">
          <form method="GET" action="/courses" className="relative">
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Поиск по названию или ключевым словам..."
              className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium transition"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </form>
        </div>

        {/* Course Grid */}
        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">Курсы не найдены</h3>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              Попробуйте изменить поисковый запрос или сбросить фильтры.
            </p>
            <Link
              href="/courses"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-xs hover:bg-blue-700 transition"
            >
              Сбросить поиск
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => {
              const totalLessons = course.modules.reduce(
                (sum, m) => sum + m.lessons.length,
                0
              );
              let parsedObjectives: string[] = [];
              try {
                parsedObjectives = JSON.parse(course.learningObjectives).slice(0, 3);
              } catch {
                parsedObjectives = [];
              }

              return (
                <div
                  key={course.id}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={course.coverImage}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-800 shadow-sm backdrop-blur-xs flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        {course.estimatedHours} ч.
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-2">
                      <span>{course.modules.length} модулей</span>
                      <span>•</span>
                      <span>{totalLessons} уроков</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <Users className="w-3.5 h-3.5" />
                        {course.enrollmentCount} студентов
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                      {course.title}
                    </h2>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {course.shortDescription}
                    </p>

                    {/* Learning outcomes preview */}
                    {parsedObjectives.length > 0 && (
                      <div className="mb-5 space-y-1.5 pt-2 border-t border-slate-100">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Чему вы научитесь:
                        </span>
                        {parsedObjectives.map((obj, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{obj}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">СТОИМОСТЬ</span>
                        <span className="text-xl font-extrabold text-slate-900">
                          ${(course.price / 100).toFixed(2)}
                        </span>
                      </div>

                      <Link
                        href={`/courses/${course.slug}`}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                      >
                        <span>Программа</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
