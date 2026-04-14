"use client";

import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentStartClient() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;
  const searchParams = useSearchParams();

  // Moyasar returns ?status=paid or ?status=failed after redirect
  const status = searchParams.get("status");
  const message = searchParams.get("message");

  const isPaid = status === "paid";
  const isFailed = status === "failed" || status === "canceled";
  const isPending = !status;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="container mx-auto px-4 pt-6">
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-primary-blue hover:text-primary-blue-400 transition-colors text-sm font-medium"
        >
          <BackArrow size={16} />
          {locale === "ar" ? "العودة إلى الدورات" : "Back to Courses"}
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-8 md:p-12 max-w-md w-full text-center">
          {isPending && (
            <>
              <Loader2 className="w-16 h-16 text-primary-blue animate-spin mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-primary-blue mb-3">
                {locale === "ar" ? "جاري معالجة الدفع..." : "Processing Payment..."}
              </h1>
              <p className="text-gray-500">
                {locale === "ar"
                  ? "يرجى الانتظار، لا تغلق هذه الصفحة."
                  : "Please wait, do not close this page."}
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
                    {locale === "ar" ? "الصفحة الرئيسية" : "Go Home"}
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
              <p className="text-gray-500 mb-2">
                {locale === "ar"
                  ? "لم يتم إتمام عملية الدفع."
                  : "The payment could not be completed."}
              </p>
              {message && (
                <p className="text-sm text-destructive mb-8">{message}</p>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/courses">
                    {locale === "ar" ? "العودة للدورات" : "Back to Courses"}
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
