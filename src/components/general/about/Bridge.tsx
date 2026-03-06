import { Icons } from "../icons";
import { useTranslations } from "next-intl";

const Bridge = () => {
    const t = useTranslations("about.bridge");

    const bridgeItems = [
        {
            icon: <Icons.aboutFamily className="w-8 h-8 text-white" />,
            title: t("items.families.title"),
            description: t("items.families.description"),
        },
        {
            icon: <Icons.aboutFocusCircle className="w-8 h-8 text-white" />,
            title: t("items.platform.title"),
            description: t("items.platform.description"),
        },
        {
            icon: <Icons.aboutCenters className="w-8 h-8 text-white" />,
            title: t("items.centers.title"),
            description: t("items.centers.description"),
        },
    ];

    return (
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4 max-w-[1320px]">
                <div
                    className="rounded-[32px] px-8 md:px-24 py-14 md:py-20 text-center"
                    style={{
                        background: 'linear-gradient(180deg, #2B3990 0%, #404FB1 100%)',
                    }}
                >
                    {/* Title */}
                    <h2
                        className="mb-8 font-bold text-[32px] md:text-[48px] leading-tight text-white"
                    >
                        {t("title")}
                    </h2>

                    {/* Description */}
                    <p className="font-medium text-sm md:text-base leading-relaxed text-white/85 mb-14 max-w-4xl mx-auto">
                        {t("description")}
                    </p>

                    {/* Three Items Row */}
                    <div className="flex flex-col sm:flex-row items-start justify-center gap-10 md:gap-16 lg:gap-24">
                        {bridgeItems.map((item) => (
                            <div
                                key={item.title}
                                className="flex flex-col items-center gap-4 max-w-[220px] mx-auto sm:mx-0"
                            >
                                {/* Icon Circle */}
                                <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
                                    {item.icon}
                                </div>

                                {/* Title */}
                                <h3 className="font-bold text-lg md:text-xl text-white">
                                    {item.title}
                                </h3>

                                {/* Description */}
                                <p className="text-xs md:text-sm text-white/75 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Bridge;
