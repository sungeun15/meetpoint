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

const featureCards = [
    {
        icon: "📍",
        title: "Location Sharing",
        description:
            "Share your current location with a single action and keep control with a manual, privacy-first flow.",
    },
    {
        icon: "💬",
        title: "Comment-style Chat",
        description:
            "Coordinate plans with a simple chat space that keeps conversations lightweight and easy to follow.",
    },
    {
        icon: "🗺️",
        title: "Midpoint Calculation",
        description:
            "Calculate a fair midpoint between two people automatically and use it as the base for meetup planning.",
    },
    {
        icon: "🎯",
        title: "Fair Place Recommendation",
        description:
            "Surface places near the midpoint so both people get balanced travel distance and better meetup options.",
    },
    {
        icon: "👥",
        title: "Easy Friend Addition",
        description:
            "Add friends quickly with a nickname-based flow so you can start chatting and sharing locations faster.",
    },
    {
        icon: "🔗",
        title: "Integrated Experience",
        description:
            "Handle chat, location, map context, and recommendation flow in one connected MeetPoint experience.",
    },
];

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: string;
    title: string;
    description: string;
}) {
    return (
        <article className="flex h-full flex-col rounded-[24px] bg-white px-6 py-7 text-center shadow-[0px_16px_40px_rgba(36,20,95,0.12)] ring-1 ring-black/5 transition-transform duration-200 hover:-translate-y-1 sm:px-7 sm:py-8 lg:px-8 lg:py-9">
            <div className="text-[44px] leading-none sm:text-[48px]">{icon}</div>
            <h2
                className={`${poppins.className} mt-5 text-[26px] leading-[1.18] text-[#1a202c] sm:text-[28px]`}
            >
                {title}
            </h2>
            <p
                className={`${inter.className} mt-4 text-[16px] leading-[1.75] text-[#4a5568] sm:text-[17px] lg:text-[18px]`}
            >
                {description}
            </p>
        </article>
    );
}

export default function FeaturesPage() {
    return (
        <main className="flex-1 bg-[linear-gradient(180deg,rgba(243,238,251,0.84)_0%,rgba(230,221,255,0.28)_100%)] text-[#1a202c]">
            <section className="mx-auto flex w-full max-w-[1440px] flex-col px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14 md:px-10 md:pt-16 lg:px-8 lg:pb-24 lg:pt-20">
                <div className="mx-auto flex max-w-[900px] flex-col items-center text-center">
                    <p
                        className={`${inter.className} rounded-full bg-white/80 px-4 py-2 text-[13px] font-medium uppercase tracking-[0.22em] text-[#5b43d6] shadow-[0px_8px_24px_rgba(91,67,214,0.12)] sm:text-[14px]`}
                    >
                        MeetPoint Features
                    </p>
                    <h1
                        className={`${poppins.className} mt-6 text-[clamp(2.6rem,8vw,4rem)] leading-[1.06] tracking-[-0.03em] text-[#24145f]`}
                    >
                        Core Features for Smarter Meetups
                    </h1>
                    <p
                        className={`${inter.className} mt-6 max-w-[760px] text-[18px] leading-[1.8] text-[#4a5568] sm:text-[20px] lg:text-[22px]`}
                    >
                        Share locations, coordinate with chat, and explore fair midpoint-based meetup recommendations in one flow.
                    </p>
                </div>

                <div className="mt-12 grid gap-5 sm:mt-14 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 xl:gap-8">
                    {featureCards.map((featureCard) => (
                        <FeatureCard
                            key={featureCard.title}
                            icon={featureCard.icon}
                            title={featureCard.title}
                            description={featureCard.description}
                        />
                    ))}
                </div>

                <div className="mt-12 flex justify-center sm:mt-14 lg:mt-16">
                    <GradientActionLink
                        href="/signup"
                        className={`${inter.className} inline-flex min-h-[56px] w-full cursor-pointer items-center justify-center rounded-[10px] px-8 py-4 text-[15px] font-semibold text-[#fafafa] shadow-[0px_10px_28px_rgba(36,20,95,0.18)] transition-transform hover:-translate-y-0.5 sm:w-auto sm:min-w-[240px] sm:text-[16px]`}
                    >
                        Get Started Now
                    </GradientActionLink>
                </div>
            </section>
        </main>
    );
}