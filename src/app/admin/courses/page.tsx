import Link from "next/link";
import prisma from "@/lib/prisma";
import { CourseActionButtons } from "@/components/admin/CourseActionButtons";
import { BookOpen, Plus, Clock, Users, ExternalLink, ArrowRight } from "lucide-react";

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      modules: {
        include: { lessons: true, quiz: true },
      },
      finalExam: true,
      enrollments: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Управление курсами платформы
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Создание, редактирование программ, структура модулей и публикация
          </p>
        </div>

        <Link
          href="/admin/courses/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить курс</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-4 px-6">Курс</th>
                <th className="py-4 px-6">Модули / Уроки</th>
                <th className="py-4 px-6">Длительность</th>
                <th className="py-4 px-6">Стоимость</th>
                <th className="py-4 px-6">Студентов</th>
                <th className="py-4 px-6">Статус</th>
                <th className="py-4 px-6 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {courses.map((course) => {
                const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);

                return (
                  <tr key={course.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={course.coverImage}
                          alt={course.title}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div>
                          <Link
                            href={`/courses/${course.slug}`}
                            target="_blank"
                            className="font-bold text-slate-900 hover:text-blue-600 flex items-center gap-1 line-clamp-1 max-w-[220px]"
                          >
                            <span>{course.title}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                          </Link>
                          <span className="text-[11px] text-slate-400">
                            Преподаватель: {course.instructorName}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-900">
                        {course.modules.length} мод. / {totalLessons} ур.
                      </span>
                      {course.finalExam && (
                        <span className="block text-[10px] text-purple-600 font-bold">
                          Экзамен включен
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 font-mono text-slate-600">
                      {course.estimatedHours} ч.
                    </td>

                    <td className="py-4 px-6 font-bold text-slate-900">
                      ${(course.price / 100).toFixed(2)}
                    </td>

                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {course.enrollments.length}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          course.isPublished
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {course.isPublished ? "Опубликован" : "Черновик"}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <CourseActionButtons
                        courseId={course.id}
                        isPublished={course.isPublished}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
