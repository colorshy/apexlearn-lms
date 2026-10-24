import prisma from "./prisma";

export interface ModuleProgressionStatus {
  moduleId: string;
  orderIndex: number;
  title: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  lessons: {
    id: string;
    title: string;
    orderIndex: number;
    durationMinutes: number;
    isCompleted: boolean;
    secondsSpent: number;
  }[];
  quiz: {
    id: string;
    title: string;
    passingScorePercent: number;
    isUnlocked: boolean;
    isPassed: boolean;
    bestScore: number | null;
    attemptsCount: number;
    maxAttempts: number;
  } | null;
}

export interface CourseProgressionSummary {
  courseId: string;
  isEnrolled: boolean;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  totalTimeSpentSeconds: number;
  modules: ModuleProgressionStatus[];
  finalExam: {
    id: string;
    title: string;
    passingScorePercent: number;
    isUnlocked: boolean;
    isPassed: boolean;
    bestScore: number | null;
    attemptsCount: number;
    maxAttempts: number;
  } | null;
  isCourseCompleted: boolean;
  completionData?: {
    completedAt: Date;
    certificateNumber: string;
    finalExamScore: number;
  } | null;
}

export async function getCourseProgression(
  courseId: string,
  userId: string
): Promise<CourseProgressionSummary> {
  // Check enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
  });

  const isEnrolled = !!enrollment && enrollment.status === "ACTIVE";

  // Fetch all modules, lessons, and quizzes
  const modules = await prisma.module.findMany({
    where: { courseId },
    orderBy: { orderIndex: "asc" },
    include: {
      lessons: {
        orderBy: { orderIndex: "asc" },
        include: {
          progresses: {
            where: { userId },
          },
        },
      },
      quiz: {
        include: {
          attempts: {
            where: { userId },
            orderBy: { scorePercent: "desc" },
          },
        },
      },
    },
  });

  // Fetch final exam
  const finalExam = await prisma.quiz.findFirst({
    where: { courseId, isFinalExam: true },
    include: {
      attempts: {
        where: { userId },
        orderBy: { scorePercent: "desc" },
      },
    },
  });

  // Fetch course completion if any
  const completion = await prisma.courseCompletion.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
  });

  let totalLessons = 0;
  let completedLessons = 0;
  let totalTimeSpentSeconds = 0;

  let previousModuleCompleted = true; // First module is unlocked if enrolled
  const moduleStatuses: ModuleProgressionStatus[] = [];

  for (const mod of modules) {
    const isUnlocked: boolean = Boolean(isEnrolled && previousModuleCompleted);

    const lessonsData = mod.lessons.map((lesson) => {
      totalLessons++;
      const userProgress = lesson.progresses[0];
      const isCompleted = userProgress?.isCompleted ?? false;
      const secondsSpent = userProgress?.secondsSpent ?? 0;
      totalTimeSpentSeconds += secondsSpent;

      if (isCompleted) {
        completedLessons++;
      }

      return {
        id: lesson.id,
        title: lesson.title,
        orderIndex: lesson.orderIndex,
        durationMinutes: lesson.durationMinutes,
        isCompleted,
        secondsSpent,
      };
    });

    const allLessonsCompletedInModule =
      lessonsData.length > 0 && lessonsData.every((l) => l.isCompleted);

    let quizData: ModuleProgressionStatus["quiz"] = null;
    let moduleQuizPassed = true; // If no quiz, considered passed

    if (mod.quiz) {
      const attempts = mod.quiz.attempts;
      const bestAttempt = attempts[0];
      const isPassed = attempts.some((a) => a.isPassed);
      moduleQuizPassed = isPassed;

      quizData = {
        id: mod.quiz.id,
        title: mod.quiz.title,
        passingScorePercent: mod.quiz.passingScorePercent,
        isUnlocked: isUnlocked && allLessonsCompletedInModule,
        isPassed,
        bestScore: bestAttempt ? bestAttempt.scorePercent : null,
        attemptsCount: attempts.length,
        maxAttempts: mod.quiz.maxAttempts,
      };
    }

    const isModuleFullyCompleted = allLessonsCompletedInModule && moduleQuizPassed;

    moduleStatuses.push({
      moduleId: mod.id,
      orderIndex: mod.orderIndex,
      title: mod.title,
      isUnlocked,
      isCompleted: isModuleFullyCompleted,
      lessons: lessonsData,
      quiz: quizData,
    });

    // To unlock the next module, this module must be completed
    previousModuleCompleted = isUnlocked && isModuleFullyCompleted;
  }

  // Final Exam logic
  let finalExamData: CourseProgressionSummary["finalExam"] = null;
  const allModulesCompleted =
    moduleStatuses.length > 0 && moduleStatuses.every((m) => m.isCompleted);

  if (finalExam) {
    const attempts = finalExam.attempts;
    const bestAttempt = attempts[0];
    const isPassed = attempts.some((a) => a.isPassed);

    finalExamData = {
      id: finalExam.id,
      title: finalExam.title,
      passingScorePercent: finalExam.passingScorePercent,
      isUnlocked: isEnrolled && allModulesCompleted,
      isPassed,
      bestScore: bestAttempt ? bestAttempt.scorePercent : null,
      attemptsCount: attempts.length,
      maxAttempts: finalExam.maxAttempts,
    };
  }

  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const isCourseCompleted =
    !!completion ||
    (allModulesCompleted && (!finalExamData || finalExamData.isPassed));

  return {
    courseId,
    isEnrolled,
    totalLessons,
    completedLessons,
    progressPercent,
    totalTimeSpentSeconds,
    modules: moduleStatuses,
    finalExam: finalExamData,
    isCourseCompleted,
    completionData: completion
      ? {
          completedAt: completion.completedAt,
          certificateNumber: completion.certificateNumber,
          finalExamScore: completion.finalExamScore,
        }
      : null,
  };
}

export async function assertCanAccessLesson(lessonId: string, userId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: true,
        },
      },
    },
  });

  if (!lesson) {
    return { allowed: false, reason: "Урок не найден", lesson: null };
  }

  const courseId = lesson.module.courseId;
  const progression = await getCourseProgression(courseId, userId);

  if (!progression.isEnrolled) {
    return {
      allowed: false,
      reason: "Вы не записаны на этот курс. Оформите покупку для доступа.",
      lesson,
    };
  }

  const moduleStatus = progression.modules.find(
    (m) => m.moduleId === lesson.moduleId
  );

  if (!moduleStatus || !moduleStatus.isUnlocked) {
    return {
      allowed: false,
      reason:
        "Этот модуль заблокирован. Завершите предыдущие уроки и сдайте проверочный квиз для разблокировки.",
      lesson,
    };
  }

  return { allowed: true, reason: null, lesson, progression };
}

export async function assertCanAccessQuiz(quizId: string, userId: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      module: true,
      course: true,
    },
  });

  if (!quiz) {
    return { allowed: false, reason: "Тест не найден", quiz: null };
  }

  const courseId = quiz.courseId ?? quiz.module?.courseId;
  if (!courseId) {
    return { allowed: false, reason: "Курс не определен", quiz: null };
  }

  const progression = await getCourseProgression(courseId, userId);

  if (!progression.isEnrolled) {
    return {
      allowed: false,
      reason: "Требуется активная подписка на курс",
      quiz,
    };
  }

  if (quiz.isFinalExam) {
    if (!progression.finalExam?.isUnlocked) {
      return {
        allowed: false,
        reason:
          "Финальный экзамен недоступен. Сначала завершите все модули курса и сдайте промежуточные тесты.",
        quiz,
      };
    }
  } else if (quiz.moduleId) {
    const modStatus = progression.modules.find((m) => m.moduleId === quiz.moduleId);
    if (!modStatus?.quiz?.isUnlocked) {
      return {
        allowed: false,
        reason:
          "Тест заблокирован. Сначала изучите и отметьте выполненными все уроки текущего модуля.",
        quiz,
      };
    }
  }

  return { allowed: true, reason: null, quiz, progression };
}

export async function getResumeLesson(courseId: string, userId: string) {
  const progression = await getCourseProgression(courseId, userId);
  if (!progression.isEnrolled) return null;

  // 1. Look for the most recently accessed incomplete lesson
  const recentProgress = await prisma.lessonProgress.findFirst({
    where: {
      userId,
      isCompleted: false,
      lesson: {
        module: {
          courseId,
        },
      },
    },
    orderBy: { lastAccessedAt: "desc" },
    include: { lesson: true },
  });

  if (recentProgress) {
    // Validate if its module is unlocked
    const modStatus = progression.modules.find(
      (m) => m.moduleId === recentProgress.lesson.moduleId
    );
    if (modStatus?.isUnlocked) {
      return recentProgress.lesson;
    }
  }

  // 2. Otherwise find the first uncompleted lesson in the first unlocked module
  for (const mod of progression.modules) {
    if (mod.isUnlocked) {
      const firstUncompleted = mod.lessons.find((l) => !l.isCompleted);
      if (firstUncompleted) {
        return prisma.lesson.findUnique({ where: { id: firstUncompleted.id } });
      }
    }
  }

  // 3. If all unlocked lessons completed, return the first lesson of the first module
  if (progression.modules[0]?.lessons[0]) {
    return prisma.lesson.findUnique({
      where: { id: progression.modules[0].lessons[0].id },
    });
  }

  return null;
}
