import { Icons } from "../icons";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

const WhyUs = () => {
    const t = useTranslations("about.whyUs");
    const locale = useLocale();
    const isRTL = locale === "ar";

    const challenges = [
        {
            icon: <Icons.aboutFamily className="h-7 w-7" style={{ color: '#B12F53' }} />,
            title: t("cards.movement.title"),
            description: t("cards.movement.description"),
            bg: 'linear-gradient(135deg, rgba(177, 47, 83, 0.1) 0%, rgba(177, 47, 83, 0.2) 100%)',
        },
        {
            icon: <Icons.aboutArrowUp className="h-7 w-7" style={{ color: '#F47E42' }} />,
            title: t("cards.transfer.title"),
            description: t("cards.transfer.description"),
            bg: 'linear-gradient(135deg, rgba(244, 126, 66, 0.1) 0%, rgba(244, 126, 66, 0.2) 100%)',
        },
        {
            icon: <Icons.aboutAlert className="h-7 w-7" style={{ color: '#2B3990' }} />,
            title: t("cards.confusion.title"),
            description: t("cards.confusion.description"),
            bg: 'linear-gradient(135deg, rgba(43, 57, 144, 0.1) 0%, rgba(43, 57, 144, 0.2) 100%)',
        },
        {
            icon: <Icons.aboutCenters className="h-7 w-7" style={{ color: '#83CBAA' }} />,
            title: t("cards.challenges.title"),
            description: t("cards.challenges.description"),
            bg: 'linear-gradient(135deg, rgba(131, 203, 170, 0.1) 0%, rgba(131, 203, 170, 0.2) 100%)',
        },
    ];

    return (
        <section className="bg-white py-16 md:py-24">
            <div className="container mx-auto px-4 max-w-[1320px]">
                {/* Header */}
                <div className="mb-16 text-center">
                    <h2
                        className="mb-6 font-bold text-[48px] leading-none text-primary"
                        style={{
                            textDecoration: 'underline',
                            textDecorationStyle: 'solid',
                            textUnderlineOffset: '50%',
                            textDecorationThickness: '10.5%'
                        }}
                    >
                        {t("title")}
                    </h2>
                    <p className="mx-auto max-w-2xl font-medium text-gray-500 text-lg">
                        {t("subtitle")}
                    </p>
                </div>

                {/* 2×2 Card Grid */}
                <div
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
                    style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                >
                    {challenges.map((challenge, index) => (
                        <div
                            key={index}
                            className="w-full rounded-3xl border border-gray-100 bg-white p-8 md:p-10 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                        >
                            {/* Icon — always at the right side of the card */}
                            <div className="flex justify-end mb-5">
                                <div
                                    className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
                                    style={{ background: challenge.bg }}
                                >
                                    {challenge.icon}
                                </div>
                            </div>

                            {/* Title */}
                            <h3
                                className="font-bold text-xl md:text-2xl text-[#2B3990] mb-4"
                                style={{ textAlign: isRTL ? 'right' : 'left' }}
                            >
                                {challenge.title}
                            </h3>

                            {/* Description */}
                            <p
                                className="text-sm md:text-base font-medium leading-relaxed text-gray-500"
                                style={{ textAlign: isRTL ? 'right' : 'left' }}
                            >
                                {challenge.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyUs;
