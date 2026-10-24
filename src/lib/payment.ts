import prisma from "./prisma";

export interface CreateCheckoutParams {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  courseTitle: string;
  customerEmail: string;
}

export interface CheckoutResult {
  checkoutUrl: string;
  providerOrderId: string;
}

export interface WebhookResult {
  orderId: string;
  transactionId: string;
  status: "PAID" | "FAILED";
}

export interface PaymentProvider {
  readonly name: string;
  createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult>;
  verifyWebhook(payload: unknown, signature: string): Promise<WebhookResult>;
}

export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";

  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
    const providerOrderId = `mock_order_${params.orderId}_${Date.now()}`;
    return {
      checkoutUrl: `/checkout/${params.orderId}`,
      providerOrderId,
    };
  }

  async verifyWebhook(payload: unknown, signature: string): Promise<WebhookResult> {
    // Validate secret signature in mock mode
    const expectedSecret = process.env.PAYMENT_WEBHOOK_SECRET || "mock_webhook_secret_key_123";
    if (signature !== expectedSecret) {
      throw new Error("INVALID_WEBHOOK_SIGNATURE");
    }

    const data = payload as { orderId: string; transactionId: string; status: "PAID" | "FAILED" };
    return {
      orderId: data.orderId,
      transactionId: data.transactionId || `mock_tx_${Date.now()}`,
      status: data.status === "PAID" ? "PAID" : "FAILED",
    };
  }
}

// Factory to get active payment gateway
export function getPaymentProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER || "mock";
  switch (provider.toLowerCase()) {
    case "mock":
    default:
      return new MockPaymentProvider();
  }
}

export async function createCourseOrder(userId: string, courseId: string) {
  // 1. Check if user already enrolled
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (existingEnrollment && existingEnrollment.status === "ACTIVE") {
    throw new Error("ALREADY_ENROLLED");
  }

  // 2. Fetch course details
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course || !course.isPublished) {
    throw new Error("COURSE_NOT_AVAILABLE");
  }

  // 3. Check for existing pending order to prevent spamming
  const existingPendingOrder = await prisma.order.findFirst({
    where: {
      userId,
      courseId,
      status: "PENDING",
    },
    orderBy: { createdAt: "desc" },
  });

  if (existingPendingOrder) {
    return existingPendingOrder;
  }

  const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const idempotencyKey = `idemp_${userId}_${courseId}_${Date.now()}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId,
      courseId,
      amount: course.price,
      currency: course.currency,
      status: "PENDING",
      paymentProvider: process.env.PAYMENT_PROVIDER || "mock",
      idempotencyKey,
    },
  });

  return order;
}

export async function processSuccessfulOrderPayment(
  orderId: string,
  transactionId: string,
  rawPayload?: unknown
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { course: true, user: true },
    });

    if (!order) {
      throw new Error("ORDER_NOT_FOUND");
    }

    // Idempotency: if already marked paid, return safely without duplicate enrollment
    if (order.status === "PAID") {
      return { order, alreadyProcessed: true };
    }

    // 1. Mark order as PAID
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
    });

    // 2. Create Payment record
    await tx.payment.create({
      data: {
        orderId,
        transactionId,
        amount: order.amount,
        currency: order.currency,
        status: "SUCCESS",
        rawPayload: rawPayload ? JSON.stringify(rawPayload) : undefined,
      },
    });

    // 3. Grant Course Enrollment
    await tx.enrollment.upsert({
      where: {
        userId_courseId: { userId: order.userId, courseId: order.courseId },
      },
      update: {
        status: "ACTIVE",
        enrolledAt: new Date(),
      },
      create: {
        userId: order.userId,
        courseId: order.courseId,
        status: "ACTIVE",
      },
    });

    // 4. Increment course enrollment count
    await tx.course.update({
      where: { id: order.courseId },
      data: {
        enrollmentCount: { increment: 1 },
      },
    });

    return { order: updatedOrder, alreadyProcessed: false };
  });
}
