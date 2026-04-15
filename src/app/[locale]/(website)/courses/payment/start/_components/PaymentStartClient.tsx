"use client";

import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentStartClient() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  const isPaid = status === "paid";
  const isFailed = status === "failed" || status === "canceled";

  return (
    // Full-screen overlay that sits on top of whatever was underneath
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center animate-in fade-in zoom-in-95 duration-200">

        {/* No status yet — still processing (shouldn't normally be seen) */}
        {!status && (
          <>
            <Loader2 className="w-16 h-16 text-primary-blue animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-primary-blue mb-3">
              {locale === "ar" ? "جاري معالجة الدفع..." : "Processing Payment..."}
            </h1>
            <p className="text-gray-500">
              {locale === "ar" ? "يرجى الانتظار." : "Please wait."}
            </p>
          </>
        )}

        {isPaid && (
          <>
            <CheckCircle2 className="w-16 h-16 text-primary-green-700 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-primary-blue mb-3">
              {locale === "ar" ? "تم الدفع بنجاح!" : "Payment Successful!"}
            </h1>
            <p className="text-gray-500 mb-8">
              {locale === "ar"
                ? "تم تأكيد حجزك. سنتواصل معك قريباً بتفاصيل الدورة."
                : "Your booking is confirmed. We'll contact you soon with course details."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/courses">
                  {locale === "ar" ? "تصفح الدورات" : "Browse Courses"}
                </Link>
              </Button>
              <Button asChild className="flex-1 blue-gradient">
                <Link href="/">
                  {locale === "ar" ? "الرئيسية" : "Go Home"}
                </Link>
              </Button>
            </div>
          </>
        )}

        {isFailed && (
          <>
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-primary-blue mb-3">
              {locale === "ar" ? "فشل الدفع" : "Payment Failed"}
            </h1>
            <p className="text-gray-500 mb-8">
              {locale === "ar"
                ? "لم يتم إتمام عملية الدفع. يمكنك المحاولة مرة أخرى."
                : "The payment could not be completed. You can try again."}
            </p>
            <Button asChild className="w-full">
              <Link href="/courses">
                {locale === "ar" ? "العودة للدورات" : "Back to Courses"}
              </Link>
            </Button>
          </>
        )}

      </div>
    </div>
  );
}
