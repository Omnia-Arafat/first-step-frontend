"use server";

import { courseService, type CourseBookingPayload } from "@/services/api";

export async function startCoursePaymentAction(
  payload: CourseBookingPayload,
  idempotencyKey: string,
) {
  try {
    const result = await courseService.startPayment(payload, idempotencyKey);
    return { success: true, payment_url: result.payment_url };
  } catch (error: any) {
    console.error("[startCoursePaymentAction] error:", JSON.stringify(error, null, 2));
    return {
      success: false,
      error: error?.message || "Failed to initiate payment",
      errors: error?.errors || {},
    };
  }
}
