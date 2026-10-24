"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitQuizAction } from "@/actions/learning-actions";
import { QuizSubmissionResult, UserAnswerInput } from "@/lib/quiz-grader";
import { useToast } from "@/components/ui/ToastProvider";
import {
  FileCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  ArrowRight,
  RotateCcw,
  Loader2,
} from "lucide-react";

interface QuestionOption {
  id: string;
  text: string;
}

interface QuestionItem {
  id: string;
  prompt: string;
  questionType: string;
  points: number;
  orderIndex: number;
  options: QuestionOption[];
}

interface QuizRunnerProps {
  quizId: string;
  quizTitle: string;
  description: string;
  isFinalExam: boolean;
  passingScorePercent: number;
  maxAttempts: number;
  timeLimitMinutes: number;
  questions: QuestionItem[];
  previousAttemptsCount: number;
  slug: string;
  nextModuleUrl?: string | null;
}

export function QuizRunner({
  quizId,
  quizTitle,
  description,
  isFinalExam,
  passingScorePercent,
  maxAttempts,
  timeLimitMinutes,
  questions,
  previousAttemptsCount,
  slug,
  nextModuleUrl,
}: QuizRunnerProps) {
  const router = useRouter();
  const toast = useToast();

  const [answers, setAnswers] = useState<Record<string, { selectedOptionIds?: string[]; shortAnswerText?: string }>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(timeLimitMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<QuizSubmissionResult | null>(null);

  const attemptsLeft = Math.max(0, maxAttempts - previousAttemptsCount);

  // Timer
  useEffect(() => {
    if (submissionResult || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [submissionResult, secondsRemaining]);

  const handleAutoSubmit = () => {
    toast.info("Время на выполнение теста истекло. Выполняется автоматическая отправка.");
    submitForm();
  };

  const handleSingleSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { selectedOptionIds: [optionId] },
    }));
  };

  const handleMultiSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => {
      const current = prev[questionId]?.selectedOptionIds || [];
      const updated = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return {
        ...prev,
        [questionId]: { selectedOptionIds: updated },
      };
    });
  };

  const handleShortAnswerChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { shortAnswerText: text },
    }));
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    const timeSpent = timeLimitMinutes * 60 - secondsRemaining;

    const formattedAnswers: UserAnswerInput[] = questions.map((q) => ({
      questionId: q.id,
      selectedOptionIds: answers[q.id]?.selectedOptionIds || [],
      shortAnswerText: answers[q.id]?.shortAnswerText || "",
    }));

    try {
      const res = await submitQuizAction({
        quizId,
        timeSpentSeconds: Math.max(5, timeSpent),
        answers: formattedAnswers,
      });

      if (res.success && res.result) {
        setSubmissionResult(res.result);
        if (res.result.isPassed) {
          toast.success("Поздравляем! Вы успешно сдали тест.");
        } else {
          toast.error("К сожалению, проходной балл не набран.");
        }
      } else {
        toast.error(res.error || "Ошибка отправки теста");
      }
    } catch {
      toast.error("Ошибка связи с сервером");
    } finally {
      setIsSubmitting(false);
    }
  };

  const minutesLeft = Math.floor(secondsRemaining / 60);
  const secondsLeft = secondsRemaining % 60;

  // View 1: Results View
  if (submissionResult) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Results Banner */}
        <div
          className={`p-8 rounded-3xl border shadow-lg ${
            submissionResult.isPassed
              ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 text-slate-900"
              : "bg-gradient-to-br from-rose-50 to-orange-50 border-rose-200 text-slate-900"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  submissionResult.isPassed
                    ? "bg-emerald-600 text-white"
                    : "bg-rose-600 text-white"
                }`}
              >
                {submissionResult.isPassed ? (
                  <CheckCircle2 className="w-10 h-10" />
                ) : (
                  <XCircle className="w-10 h-10" />
                )}
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block mb-1">
                  {submissionResult.isPassed ? "Тест успешно сдан" : "Тест не сдан"}
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight">
                  Результат: {submissionResult.scorePercent}%
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Набрано {submissionResult.pointsEarned} из {submissionResult.pointsTotal} баллов
                  (требуется {submissionResult.passingScorePercent}%)
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {submissionResult.isPassed ? (
                isFinalExam ? (
                  <button
                    onClick={() => router.push(`/learn/${slug}/completed`)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
                  >
                    <Award className="w-4 h-4" />
                    <span>Получить сертификат</span>
                  </button>
                ) : nextModuleUrl ? (
                  <button
                    onClick={() => router.push(nextModuleUrl)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Перейти к следующему модулю</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-md"
                  >
                    В дашборд
                  </button>
                )
              ) : submissionResult.attemptsRemaining > 0 ? (
                <button
                  onClick={() => {
                    setSubmissionResult(null);
                    setAnswers({});
                    setSecondsRemaining(timeLimitMinutes * 60);
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Повторить попытку (осталось {submissionResult.attemptsRemaining})</span>
                </button>
              ) : (
                <div className="text-xs text-rose-700 font-semibold">
                  Лимит попыток исчерпан. Повторите пройденные уроки.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900">Разбор ответов и пояснения</h3>

          {submissionResult.questions.map((q, idx) => (
            <div
              key={q.questionId}
              className={`p-6 rounded-3xl border bg-white shadow-xs space-y-4 ${
                q.isCorrect ? "border-emerald-200" : "border-rose-200"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span
                    className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      q.isCorrect
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {q.prompt}
                    </h4>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Тип вопроса: {q.questionType} • {q.pointsEarned} из {q.pointsPossible} баллов
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                    q.isCorrect
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {q.isCorrect ? "Верно" : "Неверно"}
                </span>
              </div>

              {/* Explanation note */}
              {q.explanation && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                    Пояснение преподавателя:
                  </span>
                  <p className="leading-relaxed">{q.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // View 2: Active Test Form
  return (
    <div className="space-y-8 pb-16">
      {/* Quiz Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-1">
              <FileCheck className="w-4 h-4" />
              <span>{isFinalExam ? "Сертификационный экзамен" : "Проверочный тест"}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">{quizTitle}</h1>
            <p className="text-xs text-slate-500 mt-1">{description}</p>
          </div>

          {/* Timer pill */}
          <div className="flex items-center gap-4 self-start sm:self-auto">
            <div className="px-4 py-2 rounded-2xl bg-slate-900 text-white flex items-center gap-2 font-mono text-sm font-bold shadow-xs">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>
                {minutesLeft}:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
              </span>
            </div>
          </div>
        </div>

        {/* Requirements info */}
        <div className="flex flex-wrap gap-4 pt-3 border-t border-slate-100 text-xs text-slate-600 font-medium">
          <span>Вопросов: {questions.length}</span>
          <span>•</span>
          <span>Порог прохождения: {passingScorePercent}%</span>
          <span>•</span>
          <span>Попытка: {previousAttemptsCount + 1} из {maxAttempts}</span>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-5"
          >
            <div className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">{q.prompt}</h3>
                <span className="text-[11px] text-slate-400 block mt-1 font-medium">
                  {q.questionType === "SINGLE_CHOICE" && "Один правильный ответ"}
                  {q.questionType === "MULTIPLE_CHOICE" && "Несколько правильных ответов (выберите все)"}
                  {q.questionType === "TRUE_FALSE" && "Верно или Неверно"}
                  {q.questionType === "SHORT_ANSWER" && "Краткий ответ словом или термином"}
                  {" • "}
                  {q.points} баллов
                </span>
              </div>
            </div>

            {/* Options based on Question Type */}
            {(q.questionType === "SINGLE_CHOICE" || q.questionType === "TRUE_FALSE") && (
              <div className="space-y-2.5 pt-1 pl-10">
                {q.options.map((opt) => {
                  const isSelected = answers[q.id]?.selectedOptionIds?.[0] === opt.id;
                  return (
                    <label
                      key={opt.id}
                      onClick={() => handleSingleSelect(q.id, opt.id)}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border text-xs sm:text-sm font-medium cursor-pointer transition ${
                        isSelected
                          ? "bg-blue-50/80 border-blue-600 text-blue-900 shadow-xs"
                          : "bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100/60"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q_${q.id}`}
                        checked={isSelected}
                        onChange={() => handleSingleSelect(q.id, opt.id)}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <span>{opt.text}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {q.questionType === "MULTIPLE_CHOICE" && (
              <div className="space-y-2.5 pt-1 pl-10">
                {q.options.map((opt) => {
                  const isSelected = answers[q.id]?.selectedOptionIds?.includes(opt.id);
                  return (
                    <label
                      key={opt.id}
                      onClick={() => handleMultiSelect(q.id, opt.id)}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border text-xs sm:text-sm font-medium cursor-pointer transition ${
                        isSelected
                          ? "bg-blue-50/80 border-blue-600 text-blue-900 shadow-xs"
                          : "bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100/60"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleMultiSelect(q.id, opt.id)}
                        className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <span>{opt.text}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {q.questionType === "SHORT_ANSWER" && (
              <div className="pt-1 pl-10">
                <input
                  type="text"
                  placeholder="Введите ваш ответ..."
                  value={answers[q.id]?.shortAnswerText || ""}
                  onChange={(e) => handleShortAnswerChange(q.id, e.target.value)}
                  className="w-full max-w-md px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Submit footer button */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="text-xs text-slate-500">
          Убедитесь, что вы ответили на все вопросы перед отправкой.
        </div>

        <button
          onClick={submitForm}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Завершить тест и проверить ответы</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
