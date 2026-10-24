import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2, "Имя должно содержать не менее 2 символов").max(50),
  email: z.string().email("Введите корректный email адрес"),
  password: z
    .string()
    .min(6, "Пароль должен содержать минимум 6 символов")
    .max(100),
});

export const LoginSchema = z.object({
  email: z.string().email("Введите корректный email адрес"),
  password: z.string().min(1, "Введите пароль"),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Введите корректный email адрес"),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Токен обязателен"),
  password: z.string().min(6, "Пароль должен быть не менее 6 символов"),
});

export const ProfileUpdateSchema = z.object({
  name: z.string().min(2, "Имя должно быть не менее 2 символов"),
  bio: z.string().max(500, "Максимум 500 символов").optional(),
  avatarUrl: z.string().url("Некорректный URL аватара").or(z.literal("")).optional(),
});

export const HeartbeatSchema = z.object({
  lessonId: z.string().min(1),
  deltaSeconds: z.number().int().min(1).max(60),
  markCompletedIfReady: z.boolean().optional(),
});

export const QuizSubmitSchema = z.object({
  quizId: z.string().min(1),
  timeSpentSeconds: z.number().int().min(0),
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedOptionIds: z.array(z.string()).optional(),
      shortAnswerText: z.string().optional(),
    })
  ),
});

export const CourseFormSchema = z.object({
  title: z.string().min(5, "Название должно быть не менее 5 символов"),
  shortDescription: z.string().min(10, "Краткое описание минимум 10 символов"),
  fullDescription: z.string().min(20, "Полное описание минимум 20 символов"),
  coverImage: z.string().url("Укажите валидный URL изображения"),
  instructorName: z.string().min(2, "Имя преподавателя обязательно"),
  instructorBio: z.string().min(10, "Биография преподавателя обязательна"),
  instructorAvatar: z.string().url("Укажите валидный URL аватара преподавателя"),
  estimatedHours: z.number().min(1).max(200),
  price: z.number().min(0),
  currency: z.string(),
  isPublished: z.boolean(),
  learningObjectives: z.string(),
  requirements: z.string(),
});
