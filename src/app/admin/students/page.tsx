import prisma from "@/lib/prisma";
import { Users, BookOpen, Clock, Award, Shield } from "lucide-react";

export default async function AdminStudentsPage() {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
    include: {
      enrollments: {
        include: { course: true },
      },
      completions: true,
      lessonProgresses: true,
      learningSessions: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Управление студентами платформы
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Список зарегистрированных учащихся, активность, прогресс по курсам и сертификаты
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-4 px-6">Студент</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Курсы</th>
                <th className="py-4 px-6">Пройдено уроков</th>
                <th className="py-4 px-6">Время учебы</th>
                <th className="py-4 px-6">Сертификаты</th>
                <th className="py-4 px-6">Дата регистрации</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {students.map((student) => {
                const completedLessonsCount = student.lessonProgresses.filter((p) => p.isCompleted).length;
                const totalSeconds = student.learningSessions.reduce((s, a) => s + a.durationSeconds, 0);

                return (
                  <tr key={student.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {student.avatarUrl ? (
                          <img
                            src={student.avatarUrl}
                            alt={student.name}
                            className="w-9 h-9 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                            {student.name.charAt(0)}
                          </div>
                        )}
                        <span className="font-bold text-slate-900">{student.name}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-500 font-mono text-[11px]">
                      {student.email}
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-900">
                        {student.enrollments.length} курс(ов)
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-bold text-blue-600">
                        {completedLessonsCount} уроков
                      </span>
                    </td>

                    <td className="py-4 px-6 font-mono text-slate-600">
                      {Math.round(totalSeconds / 60)} мин.
                    </td>

                    <td className="py-4 px-6">
                      {student.completions.length > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                          <Award className="w-3 h-3 text-emerald-600" />
                          <span>{student.completions.length} шт.</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-slate-500">
                      {new Date(student.createdAt).toLocaleDateString("ru-RU")}
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
