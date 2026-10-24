import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { CheckCircle2, Award, PlayCircle, ArrowRight, FileText } from "lucide-react";

export default async function CheckoutStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (!orderId) {
    redirect("/purchases");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      course: {
        include: {
          modules: {
            orderBy: { orderIndex: "asc" },
            include: { lessons: { orderBy: { orderIndex: "asc" } } },
          },
        },
      },
      payments: true,
    },
  });

  if (!order || order.userId !== currentUser.id) {
    notFound();
  }

  const firstLesson = order.course.modules[0]?.lessons[0];

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-slate-50">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Оплата подтверждена
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Вы успешно записаны на курс!
          </h1>
          <p className="text-xs text-slate-500">
            Заказ № {order.orderNumber} • Сумма: ${(order.amount / 100).toFixed(2)} {order.currency}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left flex gap-3 items-center">
          <img
            src={order.course.coverImage}
            alt={order.course.title}
            className="w-16 h-16 rounded-xl object-cover shrink-0"
          />
          <div>
            <h3 className="text-xs font-bold text-slate-900 line-clamp-2">
              {order.course.title}
            </h3>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {order.course.estimatedHours} ч. обучения • Доступ открыт
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          {firstLesson ? (
            <Link
              href={`/learn/${order.course.slug}/lesson/${firstLesson.id}`}
              className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Приступить к первому уроку</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
            >
              <span>Перейти в личный кабинет</span>
            </Link>
          )}

          <Link
            href="/purchases"
            className="w-full py-2.5 px-4 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-semibold"
          >
            Посмотреть историю покупок
          </Link>
        </div>
      </div>
    </div>
  );
}
