import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clean up existing records in reverse dependency order
  await prisma.quizResponse.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.answerOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.learningActivity.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.courseCompletion.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleaned database");

  // Create Users
  const passwordHash = await bcrypt.hash("admin123456", 10);
  const studentPasswordHash = await bcrypt.hash("student123456", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Александр Волков",
      email: "admin@apexlearn.com",
      passwordHash,
      role: "ADMIN",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      bio: "Главный архитектор платформы, 12+ лет в enterprise разработке.",
    },
  });

  const student = await prisma.user.create({
    data: {
      name: "Дмитрий Смирнов",
      email: "student@apexlearn.com",
      passwordHash: studentPasswordHash,
      role: "STUDENT",
      avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
      bio: "Junior фронтенд разработчик, осваивающий Full-Stack стек.",
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: "Мария Иванова",
      email: "maria@apexlearn.com",
      passwordHash: studentPasswordHash,
      role: "STUDENT",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
      bio: "UX дизайнер, изучающая веб-разработку и архитектуру.",
    },
  });

  console.log("👤 Created users: admin, student, maria");

  // Flagship Course: 30 hours
  const course1 = await prisma.course.create({
    data: {
      slug: "fullstack-mastery-nextjs-typescript",
      title: "Full-Stack Web Development Mastery: Next.js 15, TypeScript & PostgreSQL",
      shortDescription: "Комплексный 30-часовой курс от фундаментальных принципов до развертывания масштабируемых веб-приложений.",
      fullDescription: `Этот курс спроектирован для разработчиков, желающих выйти на уровень уверенного Middle/Senior Full-Stack инженера.
      
Вы изучите полный цикл разработки: от типизации бизнес-логики в TypeScript до архитектуры Server Components в Next.js 15, проектирования масштабируемых реляционных баз данных с PostgreSQL и Prisma ORM, построения безопасной сессионной аутентификации и подключения платежных шлюзов.

Курс содержит реальные практические задания, интерактивные квизы после каждого модуля, строгий трекинг времени и всесторонний финальный экзамен с выдачей верифицируемого сертификата.`,
      coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80",
      instructorName: "Александр Волков",
      instructorBio: "Staff Software Engineer, автор образовательных программ по TypeScript и облачным технологиям.",
      instructorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      estimatedHours: 30,
      price: 4900, // $49.00
      currency: "USD",
      isPublished: true,
      enrollmentCount: 142,
      learningObjectives: JSON.stringify([
        "Глубокое понимание Server vs Client Components в Next.js 15 App Router",
        "Проектирование безопасных схем баз данных и оптимизация запросов в PostgreSQL и Prisma",
        "Реализация надежной ролевой модели доступа (RBAC) и защита Server Actions",
        "Интеграция платежных шлюзов с идемпотентными вебхуками",
        "Написание юнит и интеграционных тестов с Vitest",
        "Развертывание production-ready приложений в Docker",
      ]),
      requirements: JSON.stringify([
        "Базовые знания JavaScript (ES6+) и основ HTML/CSS",
        "Понимание концепций клиент-серверного взаимодействия (HTTP, REST, JSON)",
        "Установленные Node.js и редактор кода (VS Code или WebStorm)",
      ]),
    },
  });

  // Second Course for catalog
  const course2 = await prisma.course.create({
    data: {
      slug: "ui-ux-design-systems-tailwind",
      title: "UI/UX Дизайн-системы для разработчиков: Tailwind CSS и доступность (a11y)",
      shortDescription: "Создание масштабируемых дизайн-систем, анимаций и доступных интерфейсов корпоративного уровня.",
      fullDescription: `Научитесь строить пользовательские интерфейсы, вызывающие восторг у пользователей и прошедшие сертификацию доступности WCAG AA. Мы разберем микро-анимации, работу с токенами дизайна, адаптивность и построение собственных UI-библиотек.`,
      coverImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80",
      instructorName: "Елена Романова",
      instructorBio: "Lead Product Designer & Design Systems Advocate",
      instructorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
      estimatedHours: 15,
      price: 2900,
      currency: "USD",
      isPublished: true,
      enrollmentCount: 88,
      learningObjectives: JSON.stringify([
        "Построение консистентной токенной дизайн-системы",
        "Освоение Tailwind CSS v4 и современных CSS переменных",
        "Обеспечение доступности (a11y) и навигации с клавиатуры",
        "Создание плавных физических микро-анимаций",
      ]),
      requirements: JSON.stringify([
        "Опыт работы с React и базовый CSS",
      ]),
    },
  });

  console.log("📚 Created courses: course1 (30h), course2 (15h)");

  // Module 1: Architecture & TypeScript
  const mod1 = await prisma.module.create({
    data: {
      courseId: course1.id,
      title: "Модуль 1: Архитектура современного веба и TypeScript",
      description: "Фундаментальные основы Next.js 15 App Router, разделение ответственности и глубокая типизация данных.",
      orderIndex: 1,
    },
  });

  const l1_1 = await prisma.lesson.create({
    data: {
      moduleId: mod1.id,
      title: "1.1 Архитектура Next.js 15: Server vs Client Components",
      orderIndex: 1,
      durationMinutes: 45,
      minRequiredSeconds: 60,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      content: `## Введение в React Server Components (RSC)
      
React Server Components представляют собой фундаментальный сдвиг в парадигме построения веб-приложений. В отличие от традиционного клиентского рендеринга (CSR) или даже классического SSR, Server Components исполняются **исключительно на сервере** и никогда не включаются в JavaScript-бандл клиента.

### Ключевые преимущества RSC:
1. **Нулевой размер бандла для библиотек**: Тяжелые парсеры (например, markdown, date-fns) выполняются на сервере и не отправляются браузеру.
2. **Прямой доступ к ресурсам бэкенда**: Вы можете выполнять запросы к базе данных или файловой системе прямо в теле компонента без промежуточного API-слоя.
3. **Безопасность секретов**: API-ключи, токены и приватная бизнес-логика остаются изолированными на сервере.

\`\`\`tsx
// Пример Server Component
import { prisma } from '@/lib/prisma';

export default async function CoursesList() {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    select: { id: true, title: true, price: true }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
\`\`\`

### Когда использовать Client Components (\`'use client'\`):
- Для интерактивности с обработчиками событий (\`onClick\`, \`onChange\`).
- Для хуков состояния и эффектов (\`useState\`, \`useReducer\`, \`useEffect\`).
- При использовании браузерных API (\`localStorage\`, \`navigator\`, геолокация).
- Для компонентов с анимациями (Framer Motion).`,
      resources: JSON.stringify([
        { title: "Next.js 15 Documentation: Server Components", url: "https://nextjs.org/docs/app/building-your-application/rendering/server-components" },
        { title: "Исходный код примера к уроку (GitHub)", url: "https://github.com/example/lms-rsc-starter" },
      ]),
    },
  });

  const l1_2 = await prisma.lesson.create({
    data: {
      moduleId: mod1.id,
      title: "1.2 Продвинутый TypeScript: Дженерики, Zod и Type Safety",
      orderIndex: 2,
      durationMinutes: 50,
      minRequiredSeconds: 60,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      content: `## Сквозная типобезопасность (End-to-End Type Safety)

Современная разработка требует исключения ошибок на этапе компиляции, а не во время исполнения у пользователя. Для этого мы связываем валидацию времени выполнения (Runtime validation) со статической типизацией TypeScript с помощью библиотеки **Zod**.

### Связка Zod и TypeScript:

\`\`\`ts
import { z } from 'zod';

export const CreateCourseSchema = z.object({
  title: z.string().min(5, 'Минимум 5 символов').max(100),
  price: z.number().int().nonnegative('Цена не может быть отрицательной'),
  estimatedHours: z.number().min(1).max(200),
  tags: z.array(z.string()).default([]),
});

export type CreateCourseInput = z.infer<typeof CreateCourseSchema>;
\`\`\`

Используя \`z.infer\`, мы получаем гарантированное соответствие между валидатором входных данных формы и типами функций бизнес-логики!`,
      resources: JSON.stringify([
        { title: "Zod: TypeScript-first schema declaration", url: "https://zod.dev" },
      ]),
    },
  });

  const l1_3 = await prisma.lesson.create({
    data: {
      moduleId: mod1.id,
      title: "1.3 Структура корпоративного проекта и дизайн-система",
      orderIndex: 3,
      durationMinutes: 40,
      minRequiredSeconds: 60,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      content: `## Архитектура папок и модульность

В сложных проектах правильная структура директорий определяет поддерживаемость кода на протяжении многих лет.

### Рекомендуемая структура Next.js App Router:
- \`src/app/\`: Маршруты страниц, макеты (\`layout.tsx\`), обработчики ошибок (\`error.tsx\`), индикаторы загрузки (\`loading.tsx\`).
- \`src/components/ui/\`: Атомарные переиспользуемые UI-компоненты (кнопки, модальные окна, инпуты, карточки).
- \`src/lib/\`: Утилиты, клиенты баз данных, конфигурации авторизации, адаптеры платежей.
- \`src/types/\`: Глобальные интерфейсы и перечисления.
- \`src/actions/\`: Server Actions для мутаций данных с проверкой прав доступа.`,
      resources: JSON.stringify([
        { title: "React Architecture Guidelines", url: "https://react.dev" },
      ]),
    },
  });

  // Quiz 1 for Module 1
  const quiz1 = await prisma.quiz.create({
    data: {
      moduleId: mod1.id,
      title: "Проверочный тест: Модуль 1 (Архитектура & TypeScript)",
      description: "Проверьте свои знания по Server Components, типам TypeScript и валидации Zod. Для перехода к следующему модулю необходимо набрать не менее 75%.",
      isFinalExam: false,
      passingScorePercent: 75,
      maxAttempts: 3,
      timeLimitMinutes: 15,
      shuffleQuestions: false,
      orderIndex: 4,
    },
  });

  // Question 1: Single choice
  const q1_1 = await prisma.question.create({
    data: {
      quizId: quiz1.id,
      prompt: "По умолчанию в Next.js App Router все компоненты внутри каталога app являются:",
      questionType: "SINGLE_CHOICE",
      points: 10,
      orderIndex: 1,
      explanation: "В Next.js App Router по умолчанию все компоненты рендерятся как React Server Components.",
      options: {
        create: [
          { text: "Server Components (RSC)", isCorrect: true },
          { text: "Client Components", isCorrect: false },
          { text: "Static HTML Templates", isCorrect: false },
          { text: "Edge Workers", isCorrect: false },
        ],
      },
    },
  });

  // Question 2: Multi choice
  const q1_2 = await prisma.question.create({
    data: {
      quizId: quiz1.id,
      prompt: "В каких случаях компонент ОБЯЗАТЕЛЬНО должен быть помечен директивой 'use client'? (Выберите все подходящие варианты)",
      questionType: "MULTIPLE_CHOICE",
      points: 15,
      orderIndex: 2,
      explanation: "Хуки состояния (useState, useEffect) и браузерные обработчики событий требуют выполнения на клиенте.",
      options: {
        create: [
          { text: "При использовании хука useState или useEffect", isCorrect: true },
          { text: "При добавлении обработчика событий, например onClick или onSubmit", isCorrect: true },
          { text: "При выполнении прямого запроса в базу данных через Prisma", isCorrect: false },
          { text: "При чтении cookie сессии на сервере", isCorrect: false },
        ],
      },
    },
  });

  // Question 3: True / False
  const q1_3 = await prisma.question.create({
    data: {
      quizId: quiz1.id,
      prompt: "Директива 'use client' означает, что компонент компилируется и исполняется ИСКЛЮЧИТЕЛЬНО в браузере, и никогда не участвует в начальном SSR на сервере.",
      questionType: "TRUE_FALSE",
      points: 10,
      orderIndex: 3,
      explanation: "Это неверно: клиентские компоненты все равно проходят предварительный рендеринг (pre-rendering / SSR) на сервере при первой загрузке страницы.",
      options: {
        create: [
          { text: "Верно", isCorrect: false },
          { text: "Неверно", isCorrect: true },
        ],
      },
    },
  });

  // Question 4: Short Answer
  const q1_4 = await prisma.question.create({
    data: {
      quizId: quiz1.id,
      prompt: "Как называется ключевое слово или утилита в TypeScript/Zod для автоматического вывода статического типа из схемы валидатора (например, z._____<typeof schema>)?",
      questionType: "SHORT_ANSWER",
      points: 15,
      orderIndex: 4,
      explanation: "Специальная утилита z.infer<typeof schema> позволяет автоматически вывести TypeScript тип из схемы Zod.",
      options: {
        create: [
          { text: "infer", isCorrect: true },
        ],
      },
    },
  });

  // Module 2: Database & Prisma
  const mod2 = await prisma.module.create({
    data: {
      courseId: course1.id,
      title: "Модуль 2: Проектирование баз данных и Prisma ORM",
      description: "Реляционные связи, индексы, миграции схемы, транзакционная целостность и предотвращение SQL-инъекций.",
      orderIndex: 2,
    },
  });

  const l2_1 = await prisma.lesson.create({
    data: {
      moduleId: mod2.id,
      title: "2.1 Реляционная модель данных и нормализация",
      orderIndex: 1,
      durationMinutes: 50,
      minRequiredSeconds: 60,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      content: `## Принципы нормализации реляционных баз данных

Нормализация — это процесс организации данных в базе с целью минимизации дублирования и предотвращения аномалий вставки, обновления и удаления.

### Три нормальные формы (1NF, 2NF, 3NF):
1. **Первая нормальная форма (1NF)**: Каждая ячейка содержит только атомарные (неделимые) значения. Нет повторяющихся групп строк или списков внутри текстовых полей.
2. **Вторая нормальная форма (2NF)**: Таблица находится в 1NF, и все неключевые атрибуты функционально полно зависят от первичного ключа.
3. **Третья нормальная форма (3NF)**: Таблица находится в 2NF, и отсутствуют транзитивные зависимости (когда неключевой атрибут зависит от другого неключевого атрибута).

В нашей LMS таблица \`Enrollment\` связывает \`User\` и \`Course\` с уникальным ограничением \`@@unique([userId, courseId])\`, что на уровне БД исключает двойную запись студента на один и тот же курс!`,
    },
  });

  const l2_2 = await prisma.lesson.create({
    data: {
      moduleId: mod2.id,
      title: "2.2 Prisma ORM: Миграции и транзакции",
      orderIndex: 2,
      durationMinutes: 60,
      minRequiredSeconds: 60,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      content: `## Атомарность операций через интерактивные транзакции

При покупке курса мы должны одновременно:
1. Создать или обновить запись \`Order\` в статус \`PAID\`.
2. Создать запись \`Payment\` с идентификатором транзакции.
3. Создать запись \`Enrollment\` для студента.
4. Инкрементировать счетчик \`enrollmentCount\` в курсе.

Если один из этих шагов завершится с ошибкой, база должна автоматически откатить все изменения! В Prisma это делается через \`prisma.$transaction\`:

\`\`\`ts
await prisma.$transaction(async (tx) => {
  const order = await tx.order.update({
    where: { id: orderId },
    data: { status: 'PAID', paidAt: new Date() },
  });

  await tx.payment.create({
    data: {
      orderId: order.id,
      transactionId,
      amount: order.amount,
      currency: order.currency,
      status: 'SUCCESS',
    },
  });

  await tx.enrollment.upsert({
    where: {
      userId_courseId: { userId: order.userId, courseId: order.courseId },
    },
    update: { status: 'ACTIVE' },
    create: {
      userId: order.userId,
      courseId: order.courseId,
      status: 'ACTIVE',
    },
  });

  await tx.course.update({
    where: { id: order.courseId },
    data: { enrollmentCount: { increment: 1 } },
  });
});
\`\`\``,
    },
  });

  const l2_3 = await prisma.lesson.create({
    data: {
      moduleId: mod2.id,
      title: "2.3 Индексация, фильтрация и ускорение запросов",
      orderIndex: 3,
      durationMinutes: 45,
      minRequiredSeconds: 60,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
      content: `## Оптимизация производительности запросов

Индексы в PostgreSQL позволяют находить записи за время $O(\\log N)$ вместо полного сканирования таблицы (Full Table Scan $O(N)$).

### Где необходимы индексы:
- Внешние ключи (foreign keys) в связях \`1:N\` и \`N:M\`.
- Поля, по которым регулярно выполняется фильтрация (\`where: { email: ... }\`, \`where: { isPublished: true }\`).
- Составные поля сортировки (\`@@index([courseId, orderIndex])\`).`,
    },
  });

  // Quiz 2 for Module 2
  const quiz2 = await prisma.quiz.create({
    data: {
      moduleId: mod2.id,
      title: "Проверочный тест: Модуль 2 (Базы данных & Prisma)",
      description: "Тестирование навыков проектирования схем, транзакционной логики и оптимизации запросов.",
      isFinalExam: false,
      passingScorePercent: 75,
      maxAttempts: 3,
      timeLimitMinutes: 15,
      shuffleQuestions: false,
      orderIndex: 4,
    },
  });

  await prisma.question.create({
    data: {
      quizId: quiz2.id,
      prompt: "Какой механизм в Prisma гарантирует выполнение нескольких связанных операций по принципу 'все или ничего'?",
      questionType: "SINGLE_CHOICE",
      points: 10,
      orderIndex: 1,
      options: {
        create: [
          { text: "Интерактивные транзакции (prisma.$transaction)", isCorrect: true },
          { text: "Каскадное удаление (onDelete: Cascade)", isCorrect: false },
          { text: "Оператор upsert", isCorrect: false },
          { text: "Prisma Accelerate", isCorrect: false },
        ],
      },
    },
  });

  await prisma.question.create({
    data: {
      quizId: quiz2.id,
      prompt: "Какие утверждения о нормализации данных верны? (Выберите все подходящие)",
      questionType: "MULTIPLE_CHOICE",
      points: 15,
      orderIndex: 2,
      options: {
        create: [
          { text: "Нормализация помогает избежать аномалий обновления и дублирования", isCorrect: true },
          { text: "В первой нормальной форме (1NF) каждое поле должно быть атомарным", isCorrect: true },
          { text: "Нормализация всегда увеличивает скорость чтения без необходимости JOIN", isCorrect: false },
        ],
      },
    },
  });

  // Module 3: Security & Payments
  const mod3 = await prisma.module.create({
    data: {
      courseId: course1.id,
      title: "Модуль 3: Безопасность, авторизация и платежи",
      description: "Защита аутентификации, безопасные сессии, разграничение прав доступа и интеграция платежей.",
      orderIndex: 3,
    },
  });

  const l3_1 = await prisma.lesson.create({
    data: {
      moduleId: mod3.id,
      title: "3.1 Хеширование паролей, HTTP-only Cookie и JWT",
      orderIndex: 1,
      durationMinutes: 55,
      minRequiredSeconds: 60,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
      content: `## Безопасность пользовательских данных

### Почему нельзя хранить пароли в открытом виде:
Даже при утечке дампа базы данных злоумышленники не должны иметь возможности восстановить исходные пароли. Мы используем стойкую функцию хеширования с солью — **bcrypt**.

\`\`\`ts
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
\`\`\`

### Хранение токенов в HTTP-only Cookies:
Хранение JWT в \`localStorage\` делает пользователей уязвимыми к XSS-атакам (любой внедренный вредоносный скрипт может прочитать токен).
Установка флага \`httpOnly: true\` гарантирует, что токен недоступен для чтения через JavaScript в браузере!`,
    },
  });

  const l3_2 = await prisma.lesson.create({
    data: {
      moduleId: mod3.id,
      title: "3.2 Ролевая модель доступа (RBAC) и защита Server Actions",
      orderIndex: 2,
      durationMinutes: 45,
      minRequiredSeconds: 60,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
      content: `## Никогда не доверяйте клиенту!

Проверка ролей на клиенте (скрытие кнопок «Удалить» или «Редактировать») предназначена исключительно для удобства интерфейса. **Настоящая безопасность обязана проверяться на сервере в каждом запросе.**

Каждый Server Action или API маршрут извлекает сессию из защищенной cookie, верифицирует подпись токена и сверяет роль пользователя в базе данных перед выполнением мутации.`,
    },
  });

  const l3_3 = await prisma.lesson.create({
    data: {
      moduleId: mod3.id,
      title: "3.3 Архитектура платежей и идемпотентность вебхуков",
      orderIndex: 3,
      durationMinutes: 50,
      minRequiredSeconds: 60,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4",
      content: `## Паттерн Idempotent Payment Webhook

Платежные системы могут присылать одно и то же уведомление об оплате несколько раз (network retry, timeout).
Если обработчик не идемпотентен, студент может быть зачислен повторно, или повторно отправятся письма/бонусы.

Благодаря \`idempotencyKey\` и проверке статуса заказа в транзакции, повторные запросы безопасно игнорируются с возвратом \`200 OK\`.`,
    },
  });

  // Quiz 3 for Module 3
  const quiz3 = await prisma.quiz.create({
    data: {
      moduleId: mod3.id,
      title: "Проверочный тест: Модуль 3 (Безопасность & Платежи)",
      description: "Оценка понимания механизмов защиты cookie, ролевого доступа и идемпотентности.",
      isFinalExam: false,
      passingScorePercent: 75,
      maxAttempts: 3,
      timeLimitMinutes: 15,
      shuffleQuestions: false,
      orderIndex: 4,
    },
  });

  await prisma.question.create({
    data: {
      quizId: quiz3.id,
      prompt: "Какой атрибут cookie предотвращает чтение сессионного токена через JavaScript на клиенте (защита от XSS)?",
      questionType: "SINGLE_CHOICE",
      points: 10,
      orderIndex: 1,
      options: {
        create: [
          { text: "HttpOnly", isCorrect: true },
          { text: "Secure", isCorrect: false },
          { text: "SameSite=Lax", isCorrect: false },
          { text: "Path=/", isCorrect: false },
        ],
      },
    },
  });

  await prisma.question.create({
    data: {
      quizId: quiz3.id,
      prompt: "Что означает свойство идемпотентности в обработке платежных вебхуков?",
      questionType: "SINGLE_CHOICE",
      points: 10,
      orderIndex: 2,
      options: {
        create: [
          { text: "Многократное выполнение операции с одинаковыми параметрами приводит к тому же результату, что и однократное", isCorrect: true },
          { text: "Операция выполняется строго асинхронно без ожидания ответа", isCorrect: false },
          { text: "Платеж автоматически делится между несколькими счетами", isCorrect: false },
        ],
      },
    },
  });

  // Final Exam for Course 1
  const finalExam = await prisma.quiz.create({
    data: {
      courseId: course1.id,
      title: "Финальный сертификационный экзамен: Full-Stack Web Development Mastery",
      description: "Итоговый комплексный экзамен по всем темам курса. Содержит 6 контрольных вопросов. Для успешного завершения курса и получения номерного сертификата необходимо набрать не менее 80%.",
      isFinalExam: true,
      passingScorePercent: 80,
      maxAttempts: 3,
      timeLimitMinutes: 30,
      shuffleQuestions: true,
      orderIndex: 100,
    },
  });

  await prisma.question.create({
    data: {
      quizId: finalExam.id,
      prompt: "Какие преимущества дает использование React Server Components (RSC) в сравнении с традиционным клиентским SPA?",
      questionType: "MULTIPLE_CHOICE",
      points: 20,
      orderIndex: 1,
      options: {
        create: [
          { text: "Нулевой вес зависимостей сервера в клиентском JS бандле", isCorrect: true },
          { text: "Прямой доступ к базе данных и защищенным переменным окружения", isCorrect: true },
          { text: "Улучшение метрик First Contentful Paint (FCP) и SEO", isCorrect: true },
          { text: "Возможность использовать хук useState без флага 'use client'", isCorrect: false },
        ],
      },
    },
  });

  await prisma.question.create({
    data: {
      quizId: finalExam.id,
      prompt: "Где критически важно выполнять проверку прав доступа (Authorization)?",
      questionType: "SINGLE_CHOICE",
      points: 20,
      orderIndex: 2,
      options: {
        create: [
          { text: "Исключительно на сервере в каждом Server Action / API маршруте", isCorrect: true },
          { text: "Достаточно скрыть кнопку в интерфейсе React", isCorrect: false },
          { text: "В параметрах URL браузера", isCorrect: false },
        ],
      },
    },
  });

  await prisma.question.create({
    data: {
      quizId: finalExam.id,
      prompt: "Истинно ли утверждение: для предотвращения race condition при повторных запросах вебхука оплаты необходимо использовать идемпотентные ключи и транзакции БД?",
      questionType: "TRUE_FALSE",
      points: 20,
      orderIndex: 3,
      options: {
        create: [
          { text: "Верно", isCorrect: true },
          { text: "Неверно", isCorrect: false },
        ],
      },
    },
  });

  await prisma.question.create({
    data: {
      quizId: finalExam.id,
      prompt: "Как называется библиотека схем валидации, позволяющая выводить TypeScript типы с помощью infer?",
      questionType: "SHORT_ANSWER",
      points: 20,
      orderIndex: 4,
      options: {
        create: [
          { text: "zod", isCorrect: true },
        ],
      },
    },
  });

  await prisma.question.create({
    data: {
      quizId: finalExam.id,
      prompt: "Какой тип ограничения в PostgreSQL предотвратит повторную регистрацию одного пользователя на один и тот же курс?",
      questionType: "SINGLE_CHOICE",
      points: 20,
      orderIndex: 5,
      options: {
        create: [
          { text: "UNIQUE CONSTRAINT на поля (userId, courseId)", isCorrect: true },
          { text: "CHECK CONSTRAINT на статус", isCorrect: false },
          { text: "FOREIGN KEY CONSTRAINT", isCorrect: false },
        ],
      },
    },
  });

  console.log("📝 Created Final Exam with questions");

  // Create active enrollment for Dmitry Smirnov (student)
  const enrollment = await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: course1.id,
      status: "ACTIVE",
    },
  });

  // Mark Dmitry's progress:
  // Completed lessons in Module 1:
  await prisma.lessonProgress.create({
    data: {
      userId: student.id,
      lessonId: l1_1.id,
      isCompleted: true,
      secondsSpent: 1800,
      completedAt: new Date(Date.now() - 86400000 * 2),
    },
  });

  await prisma.lessonProgress.create({
    data: {
      userId: student.id,
      lessonId: l1_2.id,
      isCompleted: true,
      secondsSpent: 2100,
      completedAt: new Date(Date.now() - 86400000 * 1.5),
    },
  });

  await prisma.lessonProgress.create({
    data: {
      userId: student.id,
      lessonId: l1_3.id,
      isCompleted: true,
      secondsSpent: 1600,
      completedAt: new Date(Date.now() - 86400000),
    },
  });

  // Passed Quiz 1 for Dmitry
  await prisma.quizAttempt.create({
    data: {
      userId: student.id,
      quizId: quiz1.id,
      scorePercent: 100,
      isPassed: true,
      attemptNumber: 1,
      timeSpentSeconds: 420,
      finishedAt: new Date(Date.now() - 86400000 * 0.8),
    },
  });

  // Now Dmitry is in Module 2 Lesson 2.1 (in progress)
  await prisma.lessonProgress.create({
    data: {
      userId: student.id,
      lessonId: l2_1.id,
      isCompleted: false,
      secondsSpent: 450,
      lastAccessedAt: new Date(),
    },
  });

  // Create Dmitry's Order & Payment
  const order1 = await prisma.order.create({
    data: {
      orderNumber: "ORD-2026-001",
      userId: student.id,
      courseId: course1.id,
      amount: 4900,
      currency: "USD",
      status: "PAID",
      paymentProvider: "mock",
      idempotencyKey: "idemp_dmitry_seed_001",
      paidAt: new Date(Date.now() - 86400000 * 3),
    },
  });

  await prisma.payment.create({
    data: {
      orderId: order1.id,
      transactionId: "TXN-MOCK-998877",
      amount: 4900,
      currency: "USD",
      status: "COMPLETED",
      rawPayload: JSON.stringify({ provider: "mock", cardLast4: "4242", authCode: "OK_AUTH" }),
    },
  });

  // Create Maria's pending order
  await prisma.order.create({
    data: {
      orderNumber: "ORD-2026-002",
      userId: student2.id,
      courseId: course2.id,
      amount: 2900,
      currency: "USD",
      status: "PENDING",
      paymentProvider: "mock",
      idempotencyKey: "idemp_maria_seed_002",
    },
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
