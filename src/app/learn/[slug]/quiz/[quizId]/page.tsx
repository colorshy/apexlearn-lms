import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { assertCanAccessQuiz } from "@/lib/progression";
import { getPublicQuizQuestions } from "@/lib/quiz-grader";
import { QuizRunner } from "@/components/learning/QuizRunner";
import { Lock, ChevronLeft, ArrowRight } from "lucide-react";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ slug: string; quizId: string }>;
}) {
  const { slug, quizId } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(`/login?redirect=/learn/${slug}/quiz/${quizId}`);
  }

  const access = await assertCanAccessQuiz(quizId, currentUser.id);

  if (!access.allowed) {
    return (
      <div className="bg-white rounded-3xl border border-rose-200 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Тест заблокирован</h2>
        <p className="text-sm text-slate-600 leading-relaxed">{access.reason}</p>
        <div className="pt-4">
          <Link
            href={`/dashboard`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
          >
            <span>В личный кабинет</span>
          </Link>
        </div>
      </div>
    );
  }

  const publicData = await getPublicQuizQuestions(quizId);
  if (!publicData) notFound();

  // Count past attempts
  const pastAttemptsCount = await prisma.quizAttempt.count({
    where: { quizId, userId: currentUser.id },
  });

  // Calculate next module url if exists
  const currentModule = access.progression?.modules.find((m) => m.quiz?.id === quizId);
  const nextMod = access.progression?.modules.find(
    (m) => m.orderIndex === (currentModule ? currentModule.orderIndex + 1 : 999)
  );

  const nextModuleUrl = nextMod && nextMod.lessons[0]
    ? `/learn/${slug}/lesson/${nextMod.lessons[0].id}`
    : access.progression?.finalExam
    ? `/learn/${slug}/exam/${access.progression.finalExam.id}`
    : `/dashboard`;

  return (
    <QuizRunner
      quizId={publicData.id}
      quizTitle={publicData.title}
      description={publicData.description}
      isFinalExam={publicData.isFinalExam}
      passingScorePercent={publicData.passingScorePercent}
      maxAttempts={publicData.maxAttempts}
      timeLimitMinutes={publicData.timeLimitMinutes}
      questions={publicData.questions}
      previousAttemptsCount={pastAttemptsCount}
      slug={slug}
      nextModuleUrl={nextModuleUrl}
    />
  );
}
