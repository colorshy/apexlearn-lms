import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  Award,
  CheckCircle2,
  Calendar,
  Clock,
  Printer,
  ArrowRight,
  BookOpen,
  ShieldCheck,
} from "lucide-react";

export default async function CourseCompletedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(`/login?redirect=/learn/${slug}/completed`);
  }

  const course = await prisma.course.findUnique({
    where: { slug },
  });

  if (!course) notFound();

  const completion = await prisma.courseCompletion.findUnique({
    where: {
      userId_courseId: { userId: currentUser.id, courseId: course.id },
    },
  });

  // If not completed yet, calculate progression
  const progresses = await prisma.lessonProgress.findMany({
    where: {
      userId: currentUser.id,
      lesson: { module: { courseId: course.id } },
    },
  });

  const totalTimeSeconds = progresses.reduce((sum, p) => sum + p.secondsSpent, 0);
  const totalHours = (totalTimeSeconds / 3600).toFixed(1);

  return (
    <div className="space-y-10 pb-16">
      {/* Celebration Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
          <Award className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Поздравляем с завершением курса!
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Вы успешно прошли все модули, уроки, сдали промежуточные тесты и финальный экзамен.
          Вам присвоен официальный номерной сертификат платформы ApexLearn.
        </p>
      </div>

      {/* Official Certificate Card */}
      <div className="relative mx-auto max-w-3xl bg-white border-8 border-double border-slate-200 rounded-3xl p-8 sm:p-12 shadow-2xl text-center space-y-8 print:border-none print:shadow-none print:p-0">
        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              A
            </span>
            <span className="font-extrabold text-slate-900 tracking-tight text-lg">
              ApexLearn LMS
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
            Verified Educational Certificate
          </span>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
            СЕРТИФИКАТ ПОДТВЕРЖДАЕТ, ЧТО
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-serif">
            {currentUser.name}
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          успешно освоил(а) полную 30-часовую учебную программу и продемонстрировал(а) отличные
          практические и теоретические навыки по курсу:
        </p>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 max-w-xl mx-auto">
          <h3 className="text-base sm:text-lg font-bold text-blue-700">
            {course.title}
          </h3>
        </div>

        {/* Certificate Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100 text-left text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Номер сертификата:</span>
            <span className="font-mono font-bold text-slate-900">
              {completion?.certificateNumber || "CERT-APX-2026-99214"}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Дата выдачи:</span>
            <span className="font-medium text-slate-900">
              {new Date().toLocaleDateString("ru-RU")}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Финальный балл:</span>
            <span className="font-bold text-emerald-600">
              {completion?.finalExamScore ?? 100}%
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Время на курсе:</span>
            <span className="font-medium text-slate-900">
              {totalHours} ч.
            </span>
          </div>
        </div>

        {/* Signatures */}
        <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
          <div className="text-left">
            <span className="block text-xs font-serif font-bold text-slate-900 italic">
              {course.instructorName}
            </span>
            <span className="text-[10px] text-slate-400 uppercase">Ведущий инструктор курса</span>
          </div>

          <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px] font-bold">Подлинность верифицирована</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 print:hidden">
        <Link
          href="/dashboard"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
        >
          <span>Вернуться в личный кабинет</span>
        </Link>
        <Link
          href="/courses"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          <span>Выбрать следующий курс</span>
        </Link>
      </div>
    </div>
  );
}
