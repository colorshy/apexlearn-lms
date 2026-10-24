import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider, processSuccessfulOrderPayment } from "@/lib/payment";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-payment-signature") || "";
    const body = await req.json();

    const provider = getPaymentProvider();
    const verified = await provider.verifyWebhook(body, signature);

    if (verified.status === "PAID") {
      const { order, alreadyProcessed } = await processSuccessfulOrderPayment(
        verified.orderId,
        verified.transactionId,
        body
      );

      return NextResponse.json({
        received: true,
        orderNumber: order.orderNumber,
        alreadyProcessed,
      });
    }

    return NextResponse.json({ received: true, status: verified.status });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook verification failed" },
      { status: 400 }
    );
  }
}
