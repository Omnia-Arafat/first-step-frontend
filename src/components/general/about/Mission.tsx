import { Icons } from "../icons";
import { useTranslations } from "next-intl";

const Mission = () => {
    const t = useTranslations("about.mission");

    const points = [
        {
            title: t("points.empowerment.title"),
            subtitle: t("points.empowerment.subtitle"),
        },
        {
            title: t("points.platform.title"),
            subtitle: t("points.platform.subtitle"),
        },
        {
            title: t("points.info.title"),
            subtitle: t("points.info.subtitle"),
        },
    ];

    return (
        <section className="bg-white py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="mb-16 text-center">
                    <h2
                        className="mb-12 font-bold text-[48px] leading-none text-primary inline-block"
                        style={{
                            textDecoration: 'underline',
                            textDecorationStyle: 'solid',
                            textUnderlineOffset: '50%',
                            textDecorationThickness: '10.5%'
                        }}
                    >
                        {t("title")}
                    </h2>
                </div>

                <div className="max-w-[1320px] mx-auto rounded-[32px] bg-white p-8 md:p-14 lg:p-20 shadow-[0_4px_24px_rgba(43,57,144,0.15)]">
                    {/* Top Row: text and icon */}
                    <div className="flex flex-col md:flex-row items-center md:items-start justify-start gap-6 mb-16 px-4 md:px-8">
                        <div className="flex-shrink-0 mt-1 relative">
                            <Icons.aboutIdea className="w-16 h-16 md:w-[72px] md:h-[72px] text-primary" />
                        </div>
                        <p className="font-normal text-[28px] leading-[48px] text-[#364153] text-start flex-1">
                            {t("description")}
                        </p>
                    </div>

                    {/* Bottom Row: Points */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-8 px-4 md:px-8">
                        {points.map((point, index) => (
                            <div key={index} className="flex flex-col items-start gap-3 w-full md:w-1/3">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-primary flex-shrink-0"></div>
                                    <h3 className="font-bold text-[28px] leading-[38px] text-primary">
                                        {point.title}
                                    </h3>
                                </div>
                                <p className="font-normal text-[22px] leading-[38px] text-[#364153] ltr:pl-6 rtl:pr-6">
                                    {point.subtitle}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Mission;
