"use server";

import { requireAuth } from "@/lib/auth";
import { processHeartbeat, markLessonComplete } from "@/lib/heartbeat";
import { gradeQuizSubmission } from "@/lib/quiz-grader";
import { assertCanAccessLesson, assertCanAccessQuiz } from "@/lib/progression";
import { createCourseOrder, processSuccessfulOrderPayment } from "@/lib/payment";
import { QuizSubmitSchema, HeartbeatSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function heartbeatAction(data: unknown) {
  const user = await requireAuth();
  const parsed = HeartbeatSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Invalid heartbeat payload" };
  }

  const { lessonId, deltaSeconds, markCompletedIfReady } = parsed.data;

  // Validate server access to lesson
  const access = await assertCanAccessLesson(lessonId, user.id);
  if (!access.allowed) {
    return { success: false, error: access.reason };
  }

  try {
    const result = await processHeartbeat({
      userId: user.id,
      lessonId,
      deltaSeconds,
      markCompletedIfReady,
    });
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function completeLessonAction(lessonId: string) {
  const user = await requireAuth();

  const access = await assertCanAccessLesson(lessonId, user.id);
  if (!access.allowed) {
    return { success: false, reason: access.reason, isCompleted: false };
  }

  const result = await markLessonComplete(user.id, lessonId);
  if (result.success) {
    revalidatePath(`/learn/[slug]`, "layout");
    revalidatePath("/dashboard");
  }
  return result;
}

export async function submitQuizAction(data: unknown) {
  const user = await requireAuth();
  const parsed = QuizSubmitSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Некорректный формат ответов" };
  }

  const { quizId, timeSpentSeconds, answers } = parsed.data;

  // Validate server-side access to quiz
  const access = await assertCanAccessQuiz(quizId, user.id);
  if (!access.allowed) {
    return { success: false, error: access.reason };
  }

  try {
    const result = await gradeQuizSubmission(
      quizId,
      user.id,
      answers,
      timeSpentSeconds
    );

    revalidatePath(`/learn/[slug]`, "layout");
    revalidatePath("/dashboard");

    return { success: true, result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function buyCourseAction(courseId: string) {
  const user = await requireAuth();

  try {
    const order = await createCourseOrder(user.id, courseId);
    return { success: true, orderId: order.id, orderNumber: order.orderNumber };
  } catch (error: any) {
    if (error.message === "ALREADY_ENROLLED") {
      return { success: false, error: "Вы уже записаны на этот курс!", alreadyEnrolled: true };
    }
    return { success: false, error: error.message || "Ошибка создания заказа" };
  }
}

export async function confirmMockPaymentAction(orderId: string) {
  const user = await requireAuth();

  try {
    const transactionId = `TXN-MOCK-${Date.now().toString().slice(-8)}`;
    const { order, alreadyProcessed } = await processSuccessfulOrderPayment(
      orderId,
      transactionId,
      { simulated: true, userAgent: "MockGateway 2.0" }
    );

    revalidatePath("/dashboard");
    revalidatePath("/purchases");
    revalidatePath(`/courses/${order.courseId}`);

    return {
      success: true,
      orderNumber: order.orderNumber,
      courseId: order.courseId,
      alreadyProcessed,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Ошибка проведения платежа" };
  }
}
