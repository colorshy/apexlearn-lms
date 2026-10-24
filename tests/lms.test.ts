import { describe, it, expect, beforeAll, afterAll } from "vitest";
import prisma from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
} from "@/lib/auth";
import {
  assertCanAccessLesson,
  assertCanAccessQuiz,
  getCourseProgression,
} from "@/lib/progression";
import {
  gradeQuizSubmission,
  getPublicQuizQuestions,
} from "@/lib/quiz-grader";
import { processHeartbeat, markLessonComplete } from "@/lib/heartbeat";
import {
  createCourseOrder,
  processSuccessfulOrderPayment,
  getPaymentProvider,
} from "@/lib/payment";

describe("LMS Full Suite Verification", () => {
  let testUserId: string;
  let testCourseId: string;
  let testMod1Id: string;
  let testMod2Id: string;
  let testLesson1Id: string;
  let testLesson2Id: string;
  let testQuiz1Id: string;
  let testExamId: string;

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        name: "Тестовый Студент",
        email: `test_student_${Date.now()}@test.com`,
        passwordHash: await hashPassword("password123"),
        role: "STUDENT",
      },
    });
    testUserId = user.id;

    // Create test course with 2 modules
    const course = await prisma.course.create({
      data: {
        slug: `test-course-${Date.now()}`,
        title: "Архитектурный тест курс",
        shortDescription: "Курс для автоматического тестирования последовательности",
        fullDescription: "Полное описание курса для Vitest",
        coverImage: "https://example.com/cover.jpg",
        instructorName: "Тест Инструктор",
        instructorBio: "Инструктор био",
        instructorAvatar: "https://example.com/avatar.jpg",
        estimatedHours: 30,
        price: 4900,
        currency: "USD",
        isPublished: true,
        learningObjectives: JSON.stringify(["Цель 1", "Цель 2"]),
        requirements: JSON.stringify(["Требование 1"]),
      },
    });
    testCourseId = course.id;

    // Module 1
    const mod1 = await prisma.module.create({
      data: {
        courseId: course.id,
        title: "Модуль 1 (Вводный)",
        description: "Основы",
        orderIndex: 1,
      },
    });
    testMod1Id = mod1.id;

    const l1 = await prisma.lesson.create({
      data: {
        moduleId: mod1.id,
        title: "Урок 1.1",
        content: "Контент урока 1.1",
        minRequiredSeconds: 30,
        orderIndex: 1,
      },
    });
    testLesson1Id = l1.id;

    // Quiz for Module 1
    const q1 = await prisma.quiz.create({
      data: {
        moduleId: mod1.id,
        title: "Тест модуля 1",
        description: "Проверка базовых знаний",
        passingScorePercent: 75,
        maxAttempts: 3,
        timeLimitMinutes: 10,
        orderIndex: 2,
      },
    });
    testQuiz1Id = q1.id;

    await prisma.question.create({
      data: {
        quizId: q1.id,
        prompt: "Что возвращает verifyPassword при верном пароле?",
        questionType: "TRUE_FALSE",
        points: 10,
        orderIndex: 1,
        options: {
          create: [
            { text: "true", isCorrect: true },
            { text: "false", isCorrect: false },
          ],
        },
      },
    });

    // Module 2 (Locked initially)
    const mod2 = await prisma.module.create({
      data: {
        courseId: course.id,
        title: "Модуль 2 (Продвинутый)",
        description: "Углубленные темы",
        orderIndex: 2,
      },
    });
    testMod2Id = mod2.id;

    const l2 = await prisma.lesson.create({
      data: {
        moduleId: mod2.id,
        title: "Урок 2.1",
        content: "Контент урока 2.1",
        minRequiredSeconds: 40,
        orderIndex: 1,
      },
    });
    testLesson2Id = l2.id;

    // Final Exam for Course
    const exam = await prisma.quiz.create({
      data: {
        courseId: course.id,
        title: "Финальный экзамен курса",
        description: "Итоговая аттестация",
        isFinalExam: true,
        passingScorePercent: 80,
        maxAttempts: 2,
        timeLimitMinutes: 20,
        orderIndex: 100,
      },
    });
    testExamId = exam.id;

    await prisma.question.create({
      data: {
        quizId: exam.id,
        prompt: "Какая библиотека используется для схем валидации?",
        questionType: "SHORT_ANSWER",
        points: 20,
        orderIndex: 1,
        options: {
          create: [{ text: "zod", isCorrect: true }],
        },
      },
    });
  });

  afterAll(async () => {
    // Clean test data
    if (testCourseId) {
      await prisma.course.delete({ where: { id: testCourseId } }).catch(() => {});
    }
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    }
  });

  // 1. Authentication & Tokens
  describe("1. Authentication & Security", () => {
    it("hashes and verifies passwords correctly", async () => {
      const raw = "securePassword999";
      const hash = await hashPassword(raw);
      expect(hash).not.toBe(raw);
      const isMatch = await verifyPassword(raw, hash);
      expect(isMatch).toBe(true);

      const isWrongMatch = await verifyPassword("wrongPass", hash);
      expect(isWrongMatch).toBe(false);
    });

    it("creates and verifies tamper-proof JWT sessions", async () => {
      const payload = {
        userId: testUserId,
        email: "test@test.com",
        name: "Студент",
        role: "STUDENT" as const,
      };

      const token = await createSessionToken(payload);
      expect(typeof token).toBe("string");

      const verified = await verifySessionToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(testUserId);
      expect(verified?.role).toBe("STUDENT");

      const corrupted = await verifySessionToken(token + "corrupted");
      expect(corrupted).toBeNull();
    });
  });

  // 2. Sequential Progression & Server Access Control
  describe("2. Strict Sequential Progression Engine", () => {
    it("denies access to unenrolled students", async () => {
      const access = await assertCanAccessLesson(testLesson1Id, testUserId);
      expect(access.allowed).toBe(false);
      expect(access.reason).toContain("не записаны");
    });

    it("enrolls student and unlocks Module 1 while Module 2 remains locked", async () => {
      await prisma.enrollment.create({
        data: {
          userId: testUserId,
          courseId: testCourseId,
          status: "ACTIVE",
        },
      });

      // Now Lesson 1 should be accessible
      const accessL1 = await assertCanAccessLesson(testLesson1Id, testUserId);
      expect(accessL1.allowed).toBe(true);

      // But Lesson in Module 2 MUST BE LOCKED
      const accessL2 = await assertCanAccessLesson(testLesson2Id, testUserId);
      expect(accessL2.allowed).toBe(false);
      expect(accessL2.reason).toContain("заблокирован");

      // Final Exam MUST BE LOCKED
      const accessExam = await assertCanAccessQuiz(testExamId, testUserId);
      expect(accessExam.allowed).toBe(false);
      expect(accessExam.reason).toContain("недоступен");
    });

    it("does not unlock Module 2 if Lesson 1 is completed but Quiz 1 is not passed", async () => {
      // Mark Lesson 1 as completed
      await prisma.lessonProgress.upsert({
        where: { userId_lessonId: { userId: testUserId, lessonId: testLesson1Id } },
        update: { isCompleted: true, secondsSpent: 35 },
        create: { userId: testUserId, lessonId: testLesson1Id, isCompleted: true, secondsSpent: 35 },
      });

      // Module 2 must STILL be locked because Quiz 1 has not been passed!
      const accessL2 = await assertCanAccessLesson(testLesson2Id, testUserId);
      expect(accessL2.allowed).toBe(false);
      expect(accessL2.reason).toContain("заблокирован");
    });

    it("unlocks Module 2 once Quiz 1 is passed", async () => {
      // Pass Quiz 1
      await prisma.quizAttempt.create({
        data: {
          quizId: testQuiz1Id,
          userId: testUserId,
          scorePercent: 100,
          isPassed: true,
          attemptNumber: 1,
        },
      });

      // Now Lesson in Module 2 must be unlocked!
      const accessL2 = await assertCanAccessLesson(testLesson2Id, testUserId);
      expect(accessL2.allowed).toBe(true);
    });
  });

  // 3. Quiz & Final Exam Grading Engine
  describe("3. Assessment & Anti-Cheat Grading Engine", () => {
    it("never leaks correct answers in getPublicQuizQuestions", async () => {
      const publicData = await getPublicQuizQuestions(testQuiz1Id);
      expect(publicData).not.toBeNull();
      const question = publicData?.questions[0];
      expect(question).toBeDefined();

      question?.options.forEach((opt: any) => {
        expect(opt.isCorrect).toBeUndefined();
      });
    });

    it("grades quiz submissions accurately and records attempts", async () => {
      const quiz = await prisma.quiz.findUnique({
        where: { id: testQuiz1Id },
        include: { questions: { include: { options: true } } },
      });
      const q = quiz!.questions[0];
      const correctOpt = q.options.find((o) => o.isCorrect)!;

      const result = await gradeQuizSubmission(
        testQuiz1Id,
        testUserId,
        [{ questionId: q.id, selectedOptionIds: [correctOpt.id] }],
        45
      );

      expect(result.scorePercent).toBe(100);
      expect(result.isPassed).toBe(true);
      expect(result.questions[0].isCorrect).toBe(true);
    });

    it("fails quiz submission if wrong answer provided", async () => {
      const quiz = await prisma.quiz.findUnique({
        where: { id: testQuiz1Id },
        include: { questions: { include: { options: true } } },
      });
      const q = quiz!.questions[0];
      const wrongOpt = q.options.find((o) => !o.isCorrect)!;

      const result = await gradeQuizSubmission(
        testQuiz1Id,
        testUserId,
        [{ questionId: q.id, selectedOptionIds: [wrongOpt.id] }],
        30
      );

      expect(result.scorePercent).toBe(0);
      expect(result.isPassed).toBe(false);
      expect(result.questions[0].isCorrect).toBe(false);
    });
  });

  // 4. Heartbeat Time Tracking
  describe("4. Time Tracking & Anti-Cheat Heartbeat", () => {
    it("clamps malicious delta values to safe bounds", async () => {
      // Malicious client tries to send 999999 seconds
      const res = await processHeartbeat({
        userId: testUserId,
        lessonId: testLesson1Id,
        deltaSeconds: 999999,
      });

      // Should be clamped to MAX_HEARTBEAT_DELTA_SECONDS (45)
      expect(res.secondsSpent).toBeLessThanOrEqual(35 + 45 + 5);
    });

    it("enforces minimum required learning time before completing lesson", async () => {
      // testLesson2Id requires 40 seconds
      // Reset progress to 10 seconds
      await prisma.lessonProgress.upsert({
        where: { userId_lessonId: { userId: testUserId, lessonId: testLesson2Id } },
        update: { isCompleted: false, secondsSpent: 10 },
        create: { userId: testUserId, lessonId: testLesson2Id, isCompleted: false, secondsSpent: 10 },
      });

      const attemptComplete = await markLessonComplete(testUserId, testLesson2Id);
      expect(attemptComplete.success).toBe(false);
      expect(attemptComplete.reason).toContain("необходимо провести на странице минимум");

      // Add time to satisfy requirement
      await prisma.lessonProgress.update({
        where: { userId_lessonId: { userId: testUserId, lessonId: testLesson2Id } },
        data: { secondsSpent: 45 },
      });

      const validComplete = await markLessonComplete(testUserId, testLesson2Id);
      expect(validComplete.success).toBe(true);
      expect(validComplete.isCompleted).toBe(true);
    });
  });

  // 5. Payment Gateway & Webhook Idempotency
  describe("5. Payment Architecture & Idempotency", () => {
    it("creates orders and handles payments idempotently without duplicate enrollments", async () => {
      // Create new fresh user for order test
      const payer = await prisma.user.create({
        data: {
          name: "Покупатель",
          email: `payer_${Date.now()}@test.com`,
          passwordHash: "hash",
          role: "STUDENT",
        },
      });

      const order = await createCourseOrder(payer.id, testCourseId);
      expect(order.status).toBe("PENDING");
      expect(order.orderNumber).toContain("ORD-");

      // 1st Payment Processing
      const txId = `TXN-TEST-${Date.now()}`;
      const firstRun = await processSuccessfulOrderPayment(order.id, txId);
      expect(firstRun.alreadyProcessed).toBe(false);
      expect(firstRun.order.status).toBe("PAID");

      // Enrollment should be active
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: payer.id, courseId: testCourseId } },
      });
      expect(enrollment?.status).toBe("ACTIVE");

      // 2nd Duplicate Webhook / Payment Processing Call (Simulating network retry)
      const duplicateRun = await processSuccessfulOrderPayment(order.id, txId);
      expect(duplicateRun.alreadyProcessed).toBe(true);
      expect(duplicateRun.order.status).toBe("PAID");

      // Verify no duplicate enrollment records created
      const enrollmentsCount = await prisma.enrollment.count({
        where: { userId: payer.id, courseId: testCourseId },
      });
      expect(enrollmentsCount).toBe(1);

      // Clean up payer
      await prisma.user.delete({ where: { id: payer.id } });
    });

    it("verifies webhook signature using secret", async () => {
      const provider = getPaymentProvider();
      const validPayload = { orderId: "order_123", transactionId: "tx_123", status: "PAID" };

      // Invalid signature
      await expect(
        provider.verifyWebhook(validPayload, "invalid_sig")
      ).rejects.toThrow("INVALID_WEBHOOK_SIGNATURE");

      // Valid signature
      const valid = await provider.verifyWebhook(validPayload, "mock_webhook_secret_key_123");
      expect(valid.status).toBe("PAID");
      expect(valid.orderId).toBe("order_123");
    });
  });
});
