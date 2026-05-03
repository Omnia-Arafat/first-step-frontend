import { Metadata } from "next";
import { Suspense } from "react";
import PaymentStartClient from "./_components/PaymentStartClient";

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await paramsPromise;
  return {
    title:
      params.locale === "ar"
        ? "تأكيد الدفع | دورات First Step"
        : "Payment Confirmation | First Step Courses",
  };
}

export default function PaymentStartPage() {
  return (
    <Suspense>
      <PaymentStartClient />
    </Suspense>
  );
}
