import { Icons } from "../icons";
import { useTranslations } from "next-intl";

const Vision = () => {
    const t = useTranslations("about.vision");

    return (
        <section className="bg-white py-16 md:py-24">
            <div className="container mx-auto px-4 flex justify-center">
                <div
                    className="w-full max-w-[1320px] rounded-[32px] px-8 py-12 md:px-[94px] md:py-16 shadow-[0_4px_24px_rgba(43,57,144,0.15)] flex flex-col md:flex-row items-start justify-between gap-10 md:gap-16"
                    style={{
                        background: 'linear-gradient(180deg, #2B3990 0%, #404FB1 100%)'
                    }}
                >
                    {/* Icon */}
                    <div className="flex-shrink-0 mb-6 md:mb-0">
                        <Icons.aboutFocusCircle className="w-[108px] h-[108px] text-white" />
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 text-start">
                        <h2 className="font-bold text-3xl md:text-[48px] leading-tight text-white mb-6">
                            {t("title")}
                        </h2>
                        <p className="font-normal text-lg md:text-[28px] leading-relaxed md:leading-[45px] text-white/90">
                            {t("description")}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Vision;
