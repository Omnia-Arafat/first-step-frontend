import { Loader2 } from "lucide-react";

const LoadingOverlay = ({ content }: { content: string }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 backdrop-blur-[2px]">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-white px-6 py-7 text-center shadow-xl">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/8 text-primary">
          <Loader2 className="size-5 animate-spin" />
        </div>
        <span dir="ltr" className="text-lg font-medium text-primary">
          {content}
        </span>
        <p className="text-sm text-mid-gray">Please wait a moment.</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
