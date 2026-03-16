"use server";

import { websiteService } from "@/services/api";

interface CourseBookingPayload {
  name: string;
  phone: string;
  email: string;
  childrenNames: string[];
  courseName: string;
}

export async function bookCourseAction(payload: CourseBookingPayload) {
  try {
    const message = [
      `Course Booking Request: ${payload.courseName}`,
      ``,
      `Parent Name: ${payload.name}`,
      `Phone: ${payload.phone}`,
      `Email: ${payload.email}`,
      ``,
      `Children Names:`,
      ...payload.childrenNames.map((name, i) => `  ${i + 1}. ${name}`),
    ].join("\n");

    const result = await websiteService.contactUs({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      subject: "حجز دورة / Course Booking",
      message,
    });

    return { success: true, data: result };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Failed to submit booking",
    };
  }
}
