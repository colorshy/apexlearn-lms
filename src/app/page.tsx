import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  BookOpen,
  GraduationCap,
  Award,
  Users,
  PlayCircle,
  Layers,
  Flame,
} from "lucide-react";

export default async function HomePage() {
  const currentUser = await getCurrentUser();

  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { enrollmentCount: "desc" },
    include: {
      modules: {
        include: {
          lessons: { select: { id: true } },
          quiz: { select: { id: true } },
        },
      },
      finalExam: { select: { id: true } },
    },
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-gradient-to-b from-white via-blue-50/30 to-transparent border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Col */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                <span>Новый стандарт онлайн-образования 2026</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Освойте профессию <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                  Full-Stack инженера
                </span>{" "}
                на реальных проектах
              </h1>

              <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Структурированные 30-часовые программы со строгой последовательностью:
                каждый модуль открывается только после прохождения уроков и сдачи проверочного квиза.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/courses"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition flex items-center justify-center gap-2 group"
                >
                  <span>Смотреть каталог курсов</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                {currentUser ? (
                  <Link
                    href="/dashboard"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base border border-slate-200 shadow-xs transition flex items-center justify-center gap-2"
                  >
                    <span>Перейти в кабинет</span>
                  </Link>
                ) : (
                  <Link
                    href="/register"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base border border-slate-200 shadow-xs transition flex items-center justify-center gap-2"
                  >
                    <span>Бесплатная регистрация</span>
                  </Link>
                )}
              </div>

              {/* Key Trust Badges */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <div className="text-2xl font-bold text-slate-900">30+ ч.</div>
                  <div className="text-xs text-slate-500 font-medium">Контента на курс</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">100%</div>
                  <div className="text-xs text-slate-500 font-medium">Серверный контроль</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">№ Сертификат</div>
                  <div className="text-xs text-slate-500 font-medium">После финал-теста</div>
                </div>
              </div>
            </div>

            {/* Right Col: Interactive Showcase Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 ring-1 ring-slate-900/5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-400"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    Живой процесс обучения
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Full-Stack Web Development</h4>
                      <p className="text-xs text-slate-500">Модуль 2 из 4 • Урок 2.2</p>
                    </div>
                  </div>

                  {/* Progress demo */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Общий прогресс курса</span>
                      <span className="text-blue-600">62%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full w-[62%] transition-all duration-1000"></div>
                    </div>
                  </div>

                  {/* Step list demo */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs">
                      <div className="flex items-center gap-2 text-emerald-800 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Модуль 1: Архитектура веба</span>
                      </div>
                      <span className="font-semibold text-emerald-700">Сдан (100%)</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs">
                      <div className="flex items-center gap-2 text-blue-800 font-medium">
                        <PlayCircle className="w-4 h-4 text-blue-600" />
                        <span>Модуль 2: Prisma & Базы данных</span>
                      </div>
                      <span className="font-semibold text-blue-700">В процессе</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs opacity-75">
                      <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        <span>Модуль 3: Безопасность и платежи</span>
                      </div>
                      <span className="text-slate-400">Закрыт</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">ВРЕМЯ АКТИВНОГО ОБУЧЕНИЯ</span>
                      <span className="font-bold text-sm">18 ч. 45 мин.</span>
                    </div>
                    <span className="px-2 py-1 rounded bg-slate-800 text-emerald-400 font-mono text-[11px]">
                      Heartbeat Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="text-blue-600 font-bold text-xs uppercase tracking-wider mb-2">
                Образовательные программы
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Доступные флагманские курсы
              </h2>
            </div>
            <Link
              href="/courses"
              className="mt-4 md:mt-0 text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Смотреть все курсы ({courses.length}) <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {courses.map((course) => {
              const totalLessons = course.modules.reduce(
                (sum, m) => sum + m.lessons.length,
                0
              );
              return (
                <div
                  key={course.id}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <img
                      src={course.coverImage}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-800 shadow-sm backdrop-blur-xs flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        {course.estimatedHours} ч.
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-sm flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" />
                        Хит
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-2">
                      <span>{course.modules.length} модулей</span>
                      <span>•</span>
                      <span>{totalLessons} уроков</span>
                      <span>•</span>
                      <span>Финальный экзамен</span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                      {course.title}
                    </h3>

                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-6">
                      {course.shortDescription}
                    </p>

                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={course.instructorAvatar}
                          alt={course.instructorName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-xs font-semibold text-slate-700">
                          {course.instructorName}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-lg font-bold text-slate-900">
                            ${(course.price / 100).toFixed(2)}
                          </span>
                        </div>
                        <Link
                          href={`/courses/${course.slug}`}
                          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition shadow-xs"
                        >
                          Подробнее
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Architecture & Methodology Highlights */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-wider">
              Методология платформы
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Почему обучение в ApexLearn дает гарантированный результат
            </h2>
            <p className="text-slate-600 text-sm mt-3">
              Мы разработали систему, которая исключает поверхностный просмотр и мотивирует к глубокому пониманию материала.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-6">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Строгая последовательность</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Невозможно перейти к сложным темам, не усвоив базу. Модули открываются последовательно после подтверждения знаний на квизах.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Античит и трекинг времени</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Серверная валидация Heartbeat пингов с детектором неактивности фиксирует реальные часы учебы, а не просто открытую вкладку.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Сертификационный экзамен</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Финальный экзамен оценивает навыки по всему 30-часовому курсу. Успешная сдача генерирует официальный номерной сертификат.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Готовы выйти на новый уровень веб-разработки?
          </h2>
          <p className="text-blue-100 text-base max-w-2xl mx-auto leading-relaxed">
            Присоединяйтесь к сообществу студентов. Начните с первого модуля уже сегодня.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-base shadow-lg transition transform active:scale-95"
            >
              Создать аккаунт бесплатно
            </Link>
            <Link
              href="/courses"
              className="px-8 py-3.5 rounded-xl bg-blue-700/60 hover:bg-blue-700 text-white border border-blue-400/40 font-bold text-base transition"
            >
              Исследовать программы
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
