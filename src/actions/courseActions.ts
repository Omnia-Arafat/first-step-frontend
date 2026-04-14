"use server";

import { courseService, type CourseBookingPayload } from "@/services/api";

export async function startCoursePaymentAction(payload: CourseBookingPayload) {
  try {
    const result = await courseService.startPayment(payload);
    return { success: true, payment_url: result.payment_url };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Failed to initiate payment",
    };
  }
}
