import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { getCurrentUser } from "@/lib/auth";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { ShieldCheck, Lock, CreditCard, Clock, BookOpen } from "lucide-react";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(`/login?redirect=/checkout/${orderId}`);
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      course: true,
      user: true,
    },
  });

  if (!order || order.userId !== currentUser.id) {
    notFound();
  }

  if (order.status === "PAID") {
    redirect(`/checkout/status?orderId=${order.id}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-lg mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Безопасная оплата заказа
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Оформление доступа к курсу
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Заказ № {order.orderNumber} • Покупатель: {currentUser.email}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Order Summary */}
          <div className="md:col-span-6 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Состав заказа
            </h2>

            <div className="flex gap-4">
              <img
                src={order.course.coverImage}
                alt={order.course.title}
                className="w-20 h-20 rounded-2xl object-cover shrink-0"
              />
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {order.course.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    {order.course.estimatedHours} ч.
                  </span>
                  <span>•</span>
                  <span>Бессрочный доступ</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Стоимость курса:</span>
                <span className="font-semibold text-slate-900">
                  ${(order.amount / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Скидка платформы:</span>
                <span className="font-semibold text-emerald-600">$0.00</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
                <span>Итого к оплате:</span>
                <span className="text-blue-600">${(order.amount / 100).toFixed(2)}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Гарантии платформы
              </span>
              <p className="leading-relaxed text-[11px] text-blue-700">
                После подтверждения платежа доступ ко всем материалам, квизам и экзамену откроется в
                личном кабинете моментально и автоматически.
              </p>
            </div>
          </div>

          {/* Payment Terminal Card */}
          <div className="md:col-span-6 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-slate-700" />
                <h2 className="text-base font-bold text-slate-900">Платежный шлюз</h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                Тестовый режим (Mock)
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Включен безопасный режим эмуляции оплаты для локального тестирования. При нажатии
              кнопки сервер сгенерирует подписанную транзакцию и моментально зачислит вас на курс.
            </p>

            <CheckoutForm orderId={order.id} amountFormatted={`$${(order.amount / 100).toFixed(2)}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
