import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ShoppingBag, ArrowRight, CreditCard, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default async function PurchasesHistoryPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirect=/purchases");
  }

  const orders = await prisma.order.findMany({
    where: { userId: currentUser.id },
    orderBy: { createdAt: "desc" },
    include: {
      course: true,
      payments: true,
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="w-7 h-7 text-blue-600" />
            <span>История покупок и заказов</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Все транзакции, оформленные курсы и платежные документы
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center max-w-md mx-auto space-y-4">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">У вас пока нет заказов</h3>
            <p className="text-xs text-slate-500">
              Ознакомьтесь с программами обучения в каталоге
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs"
            >
              <span>В каталог</span>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-4 px-6">Заказ</th>
                    <th className="py-4 px-6">Курс</th>
                    <th className="py-4 px-6">Дата</th>
                    <th className="py-4 px-6">Сумма</th>
                    <th className="py-4 px-6">Статус</th>
                    <th className="py-4 px-6 text-right">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {orders.map((order) => {
                    const isPaid = order.status === "PAID";
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-4 px-6 font-mono font-bold text-slate-900">
                          {order.orderNumber}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={order.course.coverImage}
                              alt={order.course.title}
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                            <span className="font-bold text-slate-900 line-clamp-1 max-w-[200px]">
                              {order.course.title}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-900">
                          ${(order.amount / 100).toFixed(2)}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isPaid
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {isPaid ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Clock className="w-3 h-3 text-amber-600" />
                            )}
                            <span>{isPaid ? "Оплачен" : "Ожидает оплаты"}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {isPaid ? (
                            <Link
                              href={`/courses/${order.course.slug}`}
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold"
                            >
                              <span>К курсу</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          ) : (
                            <Link
                              href={`/checkout/${order.id}`}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                            >
                              Оплатить
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
