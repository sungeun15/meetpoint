import { Inter, Poppins } from "next/font/google";

import { GradientActionLink } from "@/app/components/gradient-action-link";

const inter = Inter({
    weight: ["400", "500", "600"],
    subsets: ["latin"],
});

const poppins = Poppins({
    weight: ["500", "600"],
    subsets: ["latin"],
});

const aboutValues = [
    {
        icon: "🔗",
        title: "Integration",
        description:
            "All essential features like chat, location sharing, and recommendations are connected in one simple flow.",
    },
    {
        icon: "⚖️",
        title: "Fairness",
        description:
            "Our suggestions are designed to feel balanced for both people, not just convenient for one side.",
    },
    {
        icon: "✨",
        title: "Simplicity",
        description:
            "The product focuses on a lightweight flow so users can start coordinating quickly without unnecessary steps.",
    },
    {
        icon: "🎯",
        title: "Clarity",
        description:
            "Users can easily understand the flow from location sharing to recommendation results.",
    },
];

const aboutStackGroups = [
    {
        title: "Frontend",
        description: "Next.js 16, React, Tailwind CSS",
    },
    {
        title: "Backend & Database",
        description: "Next.js Route Handlers, Supabase",
    },
    {
        title: "Maps & Location",
        description: "Kakao Map API, Kakao Local API",
    },
    {
        title: "Collaboration",
        description: "GitHub, Jira",
    },
];

function ValueCard({
    icon,
    title,
    description,
}: {
    icon: string;
    title: string;
    description: string;
}) {
    return (
        <article className="flex h-full flex-col rounded-[20px] bg-white px-5 py-6 shadow-[0px_12px_32px_rgba(0,0,0,0.08)] ring-1 ring-black/5 sm:px-6 sm:py-7">
            <div className="text-[36px] leading-none sm:text-[40px]">{icon}</div>
            <h3 className={`${poppins.className} mt-4 text-[22px] leading-[1.2] text-[#1a202c] sm:text-[24px]`}>
                {title}
            </h3>
            <p className={`${inter.className} mt-3 text-[15px] leading-[1.8] text-[#4a5568] sm:text-[16px]`}>
                {description}
            </p>
        </article>
    );
}

export default function AboutPage() {
    return (
        <main className="flex-1 bg-[linear-gradient(180deg,rgba(243,238,251,0.84)_0%,rgba(230,221,255,0.28)_100%)] text-[#1a202c]">
            <section className="mx-auto flex w-full max-w-[1440px] flex-col px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14 md:px-10 md:pt-16 lg:px-8 lg:pb-24 lg:pt-20">
                <div className="mx-auto flex max-w-[900px] flex-col items-center text-center">
                    <p
                        className={`${inter.className} rounded-full bg-white/80 px-4 py-2 text-[13px] font-medium uppercase tracking-[0.22em] text-[#5b43d6] shadow-[0px_8px_24px_rgba(91,67,214,0.12)] sm:text-[14px]`}
                    >
                        About MeetPoint
                    </p>
                    <h1
                        className={`${poppins.className} mt-6 text-[clamp(2.6rem,8vw,4rem)] leading-[1.06] tracking-[-0.03em] text-[#24145f]`}
                    >
                        About MeetPoint
                    </h1>
                    <p
                        className={`${inter.className} mt-6 max-w-[760px] text-[18px] leading-[1.8] text-[#4a5568] sm:text-[20px] lg:text-[22px]`}
                    >
                        MeetPoint simplifies the process of meeting up with friends by combining location sharing, chat, and fair meeting point recommendations into one seamless experience.
                    </p>
                </div>

                <div className="mt-12 rounded-[24px] bg-white px-5 py-6 shadow-[0px_14px_36px_rgba(0,0,0,0.08)] ring-1 ring-black/5 sm:mt-14 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
                    <h2 className={`${poppins.className} text-[28px] leading-[1.12] text-[#1a202c] sm:text-[32px]`}>
                        Our Mission
                    </h2>
                    <p className={`${inter.className} mt-4 text-[16px] leading-[1.9] text-[#4a5568] sm:text-[17px] lg:text-[18px]`}>
                        Planning a meetup should not require juggling multiple apps. Coordinating with friends often means switching between messaging apps, map services, and place search tools, which makes the process fragmented and time-consuming.
                    </p>
                    <p className={`${inter.className} mt-4 text-[16px] leading-[1.9] text-[#4a5568] sm:text-[17px] lg:text-[18px]`}>
                        MeetPoint solves this by integrating location sharing, messaging, and place recommendations in one platform so users can find fair meetup options more easily.
                    </p>
                </div>

                <div className="mt-12 sm:mt-14 lg:mt-16">
                    <div className="mx-auto max-w-[760px] text-center">
                        <h2 className={`${poppins.className} text-[30px] leading-[1.08] tracking-[-0.03em] text-[#1a202c] sm:text-[34px]`}>
                            Core Values
                        </h2>
                    </div>

                    <div className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 xl:gap-8">
                        {aboutValues.map((value) => (
                            <ValueCard
                                key={value.title}
                                icon={value.icon}
                                title={value.title}
                                description={value.description}
                            />
                        ))}
                    </div>
                </div>

                <div className="mt-12 rounded-[24px] bg-[linear-gradient(135deg,#6675f7_0%,#57007b_100%)] px-5 py-6 text-white shadow-[0px_16px_42px_rgba(87,0,123,0.24)] sm:mt-14 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
                    <h2 className={`${poppins.className} text-[28px] leading-[1.12] sm:text-[32px]`}>
                        Technology Stack
                    </h2>
                    <div className="mt-6 grid gap-5 sm:grid-cols-2 sm:gap-6">
                        {aboutStackGroups.map((group) => (
                            <div key={group.title} className="rounded-[18px] bg-white/10 px-4 py-4 backdrop-blur-sm ring-1 ring-white/10 sm:px-5 sm:py-5">
                                <h3 className={`${poppins.className} text-[19px] leading-[1.2] sm:text-[20px]`}>
                                    {group.title}
                                </h3>
                                <p className={`${inter.className} mt-2 text-[15px] leading-[1.8] text-white/90 sm:text-[16px]`}>
                                    {group.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center rounded-[24px] bg-white px-5 py-8 text-center shadow-[0px_14px_36px_rgba(0,0,0,0.08)] ring-1 ring-black/5 sm:mt-14 sm:px-8 lg:px-10">
                    <h2 className={`${poppins.className} text-[28px] leading-[1.12] text-[#1a202c] sm:text-[32px]`}>
                        Ready to Get Started?
                    </h2>
                    <GradientActionLink
                        href="/signup"
                        className={`${inter.className} mt-6 inline-flex min-h-[56px] w-full cursor-pointer items-center justify-center rounded-[10px] px-8 py-4 text-[15px] font-semibold text-[#fafafa] shadow-[0px_10px_28px_rgba(36,20,95,0.18)] transition-transform hover:-translate-y-0.5 sm:w-auto sm:min-w-[240px] sm:text-[16px]`}
                    >
                        Join MeetPoint Today
                    </GradientActionLink>
                </div>
            </section>
        </main>
    );
}