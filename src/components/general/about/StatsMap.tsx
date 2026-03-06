import { useTranslations } from "next-intl";
import { Icons } from "../icons";

const StatsMap = () => {
    const t = useTranslations("about.stats");

    return (
        <section className="bg-white py-16 md:py-24 overflow-hidden">
            <div className="container mx-auto px-4 max-w-[1320px]">
                {/* flex-row: in RTL → first child is on right (text), second is on left (map) */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-12">

                    {/* Text Section — first in DOM = right in RTL */}
                    <div className="flex-1 text-center lg:text-start">
                        <div
                            className="font-bold text-[40px] md:text-[56px] leading-tight md:leading-[82px]"
                            style={{ color: '#2B3990' }}
                        >
                            {t("tagline1")}
                        </div>
                        <div
                            className="font-bold text-[48px] md:text-[64px] leading-tight md:leading-[63px] mt-2"
                            style={{ color: '#1F1F1F' }}
                        >
                            {t("tagline2")}<br className="hidden md:block" />{t("tagline3")}
                        </div>
                    </div>

                    {/* Map Section — second in DOM = left in RTL */}
                    <div className="relative w-full max-w-[735px] mt-16 lg:mt-0">
                        {/* Map SVG with background */}
                        <div
                            className="relative w-full rounded-lg overflow-visible"
                            style={{ backgroundColor: '#B3B4D7' }}
                        >
                            <Icons.arabMap
                                className="w-full h-auto"
                                style={{ color: '#B3B4D7' }}
                            />

                            {/* Floating Card */}
                            <div
                                className="absolute flex flex-col items-start justify-center p-6"
                                style={{
                                    width: '280px',
                                    height: '208px',
                                    background: 'linear-gradient(180deg, #2B3990 0%, #404FB1 100%)',
                                    boxShadow: '0px 5.44px 8.16px -5.44px rgba(0,0,0,0.1), 0px 13.59px 20.39px -4.08px rgba(0,0,0,0.1)',
                                    borderRadius: '24px',
                                    top: '-24px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    zIndex: 10,
                                }}
                            >
                                <Icons.aboutCenters className="w-10 h-10 text-white mb-2" />
                                <span className="font-bold text-[52px] text-white leading-none mb-1">
                                    {t("number")}
                                </span>
                                <span className="font-medium text-[18px] text-white leading-none">
                                    {t("label")}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default StatsMap;
