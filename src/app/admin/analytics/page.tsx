import prisma from "@/lib/prisma";
import { ExportCsvButton } from "@/components/admin/ExportCsvButton";
import { BarChart3, TrendingUp, Award, Clock, DollarSign, CheckCircle2 } from "lucide-react";

export default async function AdminAnalyticsPage() {
  const [
    orders,
    quizAttempts,
    completions,
    courses,
  ] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true, course: true },
    }),
    prisma.quizAttempt.findMany({
      include: { quiz: true, user: true },
    }),
    prisma.courseCompletion.findMany({
      include: { user: true, course: true },
    }),
    prisma.course.findMany({
      include: { enrollments: true },
    }),
  ]);

  const totalRevenue = orders
    .filter((o) => o.status === "PAID")
    .reduce((sum, o) => sum + o.amount, 0);

  const passedAttempts = quizAttempts.filter((a) => a.isPassed).length;
  const passRate =
    quizAttempts.length > 0
      ? Math.round((passedAttempts / quizAttempts.length) * 100)
      : 0;

  const avgScore =
    quizAttempts.length > 0
      ? Math.round(
          quizAttempts.reduce((s, a) => s + a.scorePercent, 0) / quizAttempts.length
        )
      : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Обучающая и финансовая аналитика
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Сводные отчеты по тестированию, завершению программ и выручке
          </p>
        </div>

        <ExportCsvButton />
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Процент успешной сдачи тестов
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{passRate}%</span>
            <span className="text-xs text-slate-500 font-medium">
              ({passedAttempts} из {quizAttempts.length} попыток)
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${passRate}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Средний балл по платформе
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-600">{avgScore}%</span>
            <span className="text-xs text-slate-500 font-medium">среди всех учащихся</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${avgScore}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Выдано номерных сертификатов
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-600">{completions.length}</span>
            <span className="text-xs text-slate-500 font-medium">успешных выпускников</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3">
            <div className="h-full bg-purple-600 rounded-full w-full"></div>
          </div>
        </div>
      </div>

      {/* Orders Ledger Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Полный реестр заказов и оплат ({orders.length})
        </h2>

        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-4 px-6">Номер заказа</th>
                  <th className="py-4 px-6">Студент</th>
                  <th className="py-4 px-6">Курс</th>
                  <th className="py-4 px-6">Сумма</th>
                  <th className="py-4 px-6">Провайдер</th>
                  <th className="py-4 px-6">Статус</th>
                  <th className="py-4 px-6">Дата создания</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      {order.orderNumber}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{order.user.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{order.user.email}</div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {order.course.title}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      ${(order.amount / 100).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 uppercase font-mono text-[10px] text-slate-500">
                      {order.paymentProvider}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          order.status === "PAID"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(order.createdAt).toLocaleString("ru-RU")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
