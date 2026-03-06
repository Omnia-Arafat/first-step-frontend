import { Icons } from "../icons";
import { useTranslations } from "next-intl";

const Story = () => {
    const t = useTranslations("about.story");

    const cards = [
        {
            icon: <Icons.aboutFamily className="h-10 w-10 text-white" />,
            title: t("cards.families.title"),
            description: t("cards.families.description"),
            gradient: "bg-gradient-to-b from-[#83CBAA] to-[#6BB894]",
        },
        {
            icon: <Icons.aboutChild className="h-10 w-10 text-white" />,
            title: t("cards.children.title"),
            description: t("cards.children.description"),
            gradient: "bg-gradient-to-b from-[#F47E42] to-[#E66A2E]",
        },
        {
            icon: <Icons.aboutCenters className="h-10 w-10 text-white" />,
            title: t("cards.centers.title"),
            description: t("cards.centers.description"),
            gradient: "bg-gradient-to-b from-[#B12F53] to-[#9A2846]",
        },
    ];

    return (
        <section className="bg-white py-16 md:py-24">
            <div className="container mx-auto px-4 max-w-[1320px] text-center">
                <div className="mb-16">
                    <h2
                        className="font-bold text-[48px] leading-none text-primary"
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

                <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mb-16 lg:mb-20">
                    {cards.map((card) => (
                        <div
                            key={card.title}
                            className="flex flex-col items-center rounded-2xl bg-white p-8 md:px-6 lg:px-10 py-12 shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-transform hover:-translate-y-1"
                        >
                            <div
                                className={`flex h-20 w-20 items-center justify-center rounded-full ${card.gradient} mb-8 shadow-sm`}
                            >
                                {card.icon}
                            </div>
                            <h3 className="mb-6 font-bold text-[28px] leading-[38px] text-primary">{card.title}</h3>
                            <p className="font-normal text-[22px] leading-[34px] text-[#364153]">
                                {card.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="max-w-5xl mx-auto">
                    <p className="font-normal text-[22px] leading-[34px] text-[#364153]">
                        {t("footer")}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Story;
