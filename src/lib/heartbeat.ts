import prisma from "./prisma";

const MAX_HEARTBEAT_DELTA_SECONDS = 45; // Max allowed progression per single ping
const MIN_HEARTBEAT_DELTA_SECONDS = 5;

export async function processHeartbeat(params: {
  userId: string;
  lessonId: string;
  deltaSeconds: number;
  markCompletedIfReady?: boolean;
}) {
  const { userId, lessonId, deltaSeconds, markCompletedIfReady } = params;

  // Validate delta to prevent tampering
  const safeDelta = Math.min(
    Math.max(deltaSeconds, MIN_HEARTBEAT_DELTA_SECONDS),
    MAX_HEARTBEAT_DELTA_SECONDS
  );

  // Fetch lesson
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: true,
    },
  });

  if (!lesson) {
    throw new Error("LESSON_NOT_FOUND");
  }

  const courseId = lesson.module.courseId;

  // Verify enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
  });

  if (!enrollment || enrollment.status !== "ACTIVE") {
    throw new Error("NOT_ENROLLED");
  }

  // Update or create lesson progress
  const existingProgress = await prisma.lessonProgress.findUnique({
    where: {
      userId_lessonId: { userId, lessonId },
    },
  });

  const currentSeconds = (existingProgress?.secondsSpent ?? 0) + safeDelta;
  const isEligibleForCompletion = currentSeconds >= lesson.minRequiredSeconds;
  const shouldMarkCompleted =
    existingProgress?.isCompleted || (markCompletedIfReady && isEligibleForCompletion);

  const progress = await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: { userId, lessonId },
    },
    update: {
      secondsSpent: { increment: safeDelta },
      lastAccessedAt: new Date(),
      isCompleted: shouldMarkCompleted ? true : undefined,
      completedAt:
        shouldMarkCompleted && !existingProgress?.isCompleted ? new Date() : undefined,
    },
    create: {
      userId,
      lessonId,
      secondsSpent: safeDelta,
      isCompleted: shouldMarkCompleted,
      completedAt: shouldMarkCompleted ? new Date() : undefined,
    },
  });

  // Track learning activity
  await prisma.learningActivity.create({
    data: {
      userId,
      courseId,
      lessonId,
      durationSeconds: safeDelta,
    },
  });

  return {
    lessonId,
    secondsSpent: progress.secondsSpent,
    minRequiredSeconds: lesson.minRequiredSeconds,
    isCompleted: progress.isCompleted,
  };
}

export async function markLessonComplete(userId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: true },
  });

  if (!lesson) throw new Error("LESSON_NOT_FOUND");

  const progress = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });

  const secondsSpent = progress?.secondsSpent ?? 0;
  if (secondsSpent < lesson.minRequiredSeconds) {
    return {
      success: false,
      reason: `Для завершения урока необходимо провести на странице минимум ${lesson.minRequiredSeconds} сек. (текущее время: ${secondsSpent} сек.)`,
      isCompleted: false,
    };
  }

  const updated = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: {
      isCompleted: true,
      completedAt: new Date(),
      lastAccessedAt: new Date(),
    },
    create: {
      userId,
      lessonId,
      secondsSpent,
      isCompleted: true,
      completedAt: new Date(),
    },
  });

  return {
    success: true,
    reason: null,
    isCompleted: updated.isCompleted,
  };
}
