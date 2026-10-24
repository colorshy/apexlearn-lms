import prisma from "./prisma";

export interface UserAnswerInput {
  questionId: string;
  selectedOptionIds?: string[];
  shortAnswerText?: string;
}

export interface QuestionResult {
  questionId: string;
  prompt: string;
  questionType: string;
  pointsPossible: number;
  pointsEarned: number;
  isCorrect: boolean;
  explanation: string | null;
  correctOptionIds: string[];
  userSelectedOptionIds?: string[];
  userShortAnswer?: string;
}

export interface QuizSubmissionResult {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  isFinalExam: boolean;
  scorePercent: number;
  pointsEarned: number;
  pointsTotal: number;
  isPassed: boolean;
  passingScorePercent: number;
  attemptNumber: number;
  maxAttempts: number;
  attemptsRemaining: number;
  timeSpentSeconds: number;
  certificateNumber?: string;
  questions: QuestionResult[];
}

export async function getPublicQuizQuestions(quizId: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { orderIndex: "asc" },
        include: {
          options: {
            select: {
              id: true,
              text: true,
              // NOTE: isCorrect is NEVER returned to client before grading!
            },
          },
        },
      },
    },
  });

  if (!quiz) return null;

  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    isFinalExam: quiz.isFinalExam,
    passingScorePercent: quiz.passingScorePercent,
    maxAttempts: quiz.maxAttempts,
    timeLimitMinutes: quiz.timeLimitMinutes,
    shuffleQuestions: quiz.shuffleQuestions,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      questionType: q.questionType,
      points: q.points,
      orderIndex: q.orderIndex,
      options: q.options,
    })),
  };
}

export async function gradeQuizSubmission(
  quizId: string,
  userId: string,
  answers: UserAnswerInput[],
  timeSpentSeconds: number
): Promise<QuizSubmissionResult> {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { orderIndex: "asc" },
        include: {
          options: true,
        },
      },
      module: {
        include: { course: true },
      },
      course: true,
    },
  });

  if (!quiz) {
    throw new Error("QUIZ_NOT_FOUND");
  }

  // Count existing attempts
  const previousAttempts = await prisma.quizAttempt.findMany({
    where: { quizId, userId },
    orderBy: { attemptNumber: "desc" },
  });

  if (previousAttempts.length >= quiz.maxAttempts) {
    throw new Error("MAX_ATTEMPTS_EXCEEDED");
  }

  const attemptNumber = previousAttempts.length + 1;

  let pointsTotal = 0;
  let pointsEarned = 0;
  const questionResults: QuestionResult[] = [];
  const responsesToCreate: {
    questionId: string;
    selectedOptionIds?: string;
    shortAnswerText?: string;
    isCorrect: boolean;
    pointsEarned: number;
  }[] = [];

  for (const question of quiz.questions) {
    pointsTotal += question.points;
    const answer = answers.find((a) => a.questionId === question.id);

    const correctOptions = question.options.filter((o) => o.isCorrect);
    const correctOptionIds = correctOptions.map((o) => o.id);
    const userSelectedIds = answer?.selectedOptionIds ?? [];
    const userShortText = answer?.shortAnswerText?.trim() ?? "";

    let isCorrect = false;

    if (question.questionType === "SINGLE_CHOICE" || question.questionType === "TRUE_FALSE") {
      isCorrect =
        userSelectedIds.length === 1 &&
        correctOptionIds.length === 1 &&
        userSelectedIds[0] === correctOptionIds[0];
    } else if (question.questionType === "MULTIPLE_CHOICE") {
      // Must select all correct and no incorrect
      const hasAllCorrect = correctOptionIds.every((id) => userSelectedIds.includes(id));
      const hasNoIncorrect = userSelectedIds.every((id) => correctOptionIds.includes(id));
      isCorrect = hasAllCorrect && hasNoIncorrect && correctOptionIds.length > 0;
    } else if (question.questionType === "SHORT_ANSWER") {
      // Case-insensitive match with any correct answer option
      const normalizedUser = userShortText.toLowerCase().replace(/\s+/g, " ");
      isCorrect = correctOptions.some(
        (opt) => opt.text.trim().toLowerCase().replace(/\s+/g, " ") === normalizedUser
      );
    }

    const earned = isCorrect ? question.points : 0;
    pointsEarned += earned;

    questionResults.push({
      questionId: question.id,
      prompt: question.prompt,
      questionType: question.questionType,
      pointsPossible: question.points,
      pointsEarned: earned,
      isCorrect,
      explanation: question.explanation,
      correctOptionIds,
      userSelectedOptionIds: userSelectedIds,
      userShortAnswer: userShortText,
    });

    responsesToCreate.push({
      questionId: question.id,
      selectedOptionIds: userSelectedIds.length > 0 ? JSON.stringify(userSelectedIds) : undefined,
      shortAnswerText: userShortText || undefined,
      isCorrect,
      pointsEarned: earned,
    });
  }

  const scorePercent =
    pointsTotal > 0 ? Math.round((pointsEarned / pointsTotal) * 100) : 0;
  const isPassed = scorePercent >= quiz.passingScorePercent;

  const targetCourseId = quiz.courseId ?? quiz.module?.courseId;

  // Persist attempt and responses in transaction
  const result = await prisma.$transaction(async (tx) => {
    const attempt = await tx.quizAttempt.create({
      data: {
        quizId,
        userId,
        scorePercent,
        isPassed,
        attemptNumber,
        timeSpentSeconds,
        finishedAt: new Date(),
        responses: {
          create: responsesToCreate,
        },
      },
    });

    let certificateNumber: string | undefined;

    // If Final Exam and passed, create CourseCompletion
    if (quiz.isFinalExam && isPassed && targetCourseId) {
      certificateNumber = `CERT-APX-${Date.now().toString().slice(-6)}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

      await tx.courseCompletion.upsert({
        where: {
          userId_courseId: { userId, courseId: targetCourseId },
        },
        update: {
          finalExamScore: scorePercent,
          completedAt: new Date(),
        },
        create: {
          userId,
          courseId: targetCourseId,
          certificateNumber,
          finalExamScore: scorePercent,
        },
      });

      await tx.enrollment.update({
        where: {
          userId_courseId: { userId, courseId: targetCourseId },
        },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });
    }

    return { attempt, certificateNumber };
  });

  return {
    attemptId: result.attempt.id,
    quizId: quiz.id,
    quizTitle: quiz.title,
    isFinalExam: quiz.isFinalExam,
    scorePercent,
    pointsEarned,
    pointsTotal,
    isPassed,
    passingScorePercent: quiz.passingScorePercent,
    attemptNumber,
    maxAttempts: quiz.maxAttempts,
    attemptsRemaining: Math.max(0, quiz.maxAttempts - attemptNumber),
    timeSpentSeconds,
    certificateNumber: result.certificateNumber,
    questions: questionResults,
  };
}
