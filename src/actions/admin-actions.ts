"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { CourseFormSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function createCourseAction(data: unknown) {
  await requireAdmin();

  const parsed = CourseFormSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const { title, ...rest } = parsed.data;
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "") + `-${Date.now().toString().slice(-4)}`;

  try {
    const course = await prisma.course.create({
      data: {
        title,
        slug,
        ...rest,
      },
    });

    revalidatePath("/admin/courses");
    revalidatePath("/courses");
    return { success: true, courseId: course.id, slug: course.slug };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleCoursePublishAction(courseId: string) {
  await requireAdmin();

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return { success: false, error: "Курс не найден" };

  const updated = await prisma.course.update({
    where: { id: courseId },
    data: { isPublished: !course.isPublished },
  });

  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  revalidatePath(`/courses/${course.slug}`);

  return { success: true, isPublished: updated.isPublished };
}

export async function deleteCourseAction(courseId: string) {
  await requireAdmin();

  try {
    await prisma.course.delete({ where: { id: courseId } });
    revalidatePath("/admin/courses");
    revalidatePath("/courses");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function exportAnalyticsCsvAction() {
  await requireAdmin();

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      enrollments: {
        include: { course: true },
      },
      completions: {
        include: { course: true },
      },
      learningSessions: true,
      quizAttempts: true,
    },
  });

  // Build CSV
  const header = "Student Name,Email,Course,Status,Enrolled Date,Completed Date,Total Study Seconds,Total Quiz Attempts,Final Exam Score\n";
  const rows = students.flatMap((student) => {
    return student.enrollments.map((enr) => {
      const completion = student.completions.find((c) => c.courseId === enr.courseId);
      const totalSeconds = student.learningSessions
        .filter((s) => s.courseId === enr.courseId)
        .reduce((sum, s) => sum + s.durationSeconds, 0);
      const attemptsCount = student.quizAttempts.length;

      return `"${student.name}","${student.email}","${enr.course.title}","${enr.status}","${enr.enrolledAt.toISOString()}","${completion?.completedAt?.toISOString() || "N/A"}","${totalSeconds}","${attemptsCount}","${completion?.finalExamScore ?? "N/A"}"`;
    });
  });

  return {
    success: true,
    csv: header + rows.join("\n"),
  };
}
