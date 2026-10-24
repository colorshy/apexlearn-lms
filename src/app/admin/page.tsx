import Link from "next/link";
import prisma from "@/lib/prisma";
import {
  Users,
  DollarSign,
  BookOpen,
  Clock,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const [
    totalStudents,
    totalCourses,
    paidOrders,
    recentOrders,
    recentAttempts,
    learningActivities,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.course.count(),
    prisma.order.findMany({ where: { status: "PAID" }, select: { amount: true } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: true, course: true },
    }),
    prisma.quizAttempt.findMany({
      take: 5,
      orderBy: { startedAt: "desc" },
      include: { user: true, quiz: true },
    }),
    prisma.learningActivity.findMany({ select: { durationSeconds: true } }),
  ]);

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0);
  const totalSeconds = learningActivities.reduce((sum, a) => sum + a.durationSeconds, 0);
  const totalStudyHours = (totalSeconds / 3600).toFixed(1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Панель управления платформой
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Ключевые показатели эффективности, финансовая сводка и активность студентов
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Выручка (Оплачено)
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              ${(totalRevenue / 100).toFixed(2)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Студентов
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {totalStudents}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Курсов в каталоге
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {totalCourses}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Часов обучения
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {totalStudyHours} ч.
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Two columns: Recent Orders & Recent Quiz Attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Последние заказы</h3>
            <Link
              href="/admin/analytics"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Все заказы <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 border border-slate-100 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">{order.user.name}</div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                    {order.course.title}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-slate-900">
                    ${(order.amount / 100).toFixed(2)}
                  </div>
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      order.status === "PAID"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Quiz Attempts */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Недавние сдачи тестов</h3>
            <span className="text-xs text-slate-400">Автоматическая оценка</span>
          </div>

          <div className="space-y-2.5">
            {recentAttempts.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 border border-slate-100 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">{att.user.name}</div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                    {att.quiz.title}
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block font-bold text-xs ${
                      att.isPassed ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {att.scorePercent}%
                  </span>
                  <div className="text-[10px] text-slate-400">
                    {att.isPassed ? "Сдан ✓" : "Не сдан ✗"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
