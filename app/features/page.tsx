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
            "Save your current location only when you choose to share it, keeping the flow manual instead of real-time tracking.",
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
            "Calculate the midpoint from the average of two coordinates and use it as the starting point for meetup planning.",
    },
    {
        icon: "🎯",
        title: "Fair Place Recommendation",
        description:
            "Rank places around the midpoint with distance and fairness scores, then return the top three meetup options.",
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
            "See your location, your friend's location, the midpoint, and recommendation results together in one connected flow.",
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
        <article className="flex h-full flex-col items-center rounded-[22px] bg-white px-5 py-6 text-center shadow-[0px_16px_40px_rgba(36,20,95,0.12)] ring-1 ring-black/5 transition-transform duration-200 hover:-translate-y-1 sm:rounded-[24px] sm:px-7 sm:py-8 lg:px-8 lg:py-9">
            <div className="text-[40px] leading-none sm:text-[46px] lg:text-[48px]">{icon}</div>
            <h2
                className={`${poppins.className} mt-4 text-[24px] leading-[1.18] text-[#1a202c] sm:mt-5 sm:text-[27px] lg:text-[28px]`}
            >
                {title}
            </h2>
            <p
                className={`${inter.className} mt-3 max-w-[30ch] text-[15px] leading-[1.75] text-[#4a5568] sm:mt-4 sm:max-w-none sm:text-[16px] lg:text-[18px]`}
            >
                {description}
            </p>
        </article>
    );
}

export default function FeaturesPage() {
    return (
        <main className="flex-1 bg-[linear-gradient(180deg,rgba(243,238,251,0.84)_0%,rgba(230,221,255,0.28)_100%)] text-[#1a202c]">
            <section className="mx-auto flex w-full max-w-[1440px] flex-col px-4 pb-14 pt-8 sm:px-8 sm:pb-20 sm:pt-14 md:px-10 md:pt-16 lg:px-8 lg:pb-24 lg:pt-20">
                <div className="mx-auto flex max-w-[900px] flex-col items-center text-center sm:max-w-[820px]">
                    <p
                        className={`${inter.className} rounded-full bg-white/80 px-4 py-2 text-[12px] font-medium uppercase tracking-[0.2em] text-[#5b43d6] shadow-[0px_8px_24px_rgba(91,67,214,0.12)] sm:text-[14px]`}
                    >
                        MeetPoint Features
                    </p>
                    <h1
                        className={`${poppins.className} mt-5 text-[clamp(2.2rem,9vw,4rem)] leading-[1.08] tracking-[-0.03em] text-[#24145f] sm:mt-6`}
                    >
                        Core Features for Smarter Meetups
                    </h1>
                    <p
                        className={`${inter.className} mt-5 max-w-[44rem] text-[16px] leading-[1.8] text-[#4a5568] sm:mt-6 sm:text-[19px] lg:text-[22px]`}
                    >
                        Share locations manually, compare positions on the map, and explore top midpoint-based recommendations in one flow.
                    </p>
                </div>

                <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 xl:gap-8">
                    {featureCards.map((featureCard) => (
                        <FeatureCard
                            key={featureCard.title}
                            icon={featureCard.icon}
                            title={featureCard.title}
                            description={featureCard.description}
                        />
                    ))}
                </div>

                <div className="mt-10 flex justify-center sm:mt-14 lg:mt-16">
                    <GradientActionLink
                        href="/signup"
                        className={`${inter.className} inline-flex min-h-[56px] w-full cursor-pointer items-center justify-center rounded-[10px] px-6 py-4 text-[15px] font-semibold text-[#fafafa] shadow-[0px_10px_28px_rgba(36,20,95,0.18)] transition-transform hover:-translate-y-0.5 sm:w-auto sm:min-w-[240px] sm:px-8 sm:text-[16px]`}
                    >
                        Get Started Now
                    </GradientActionLink>
                </div>
            </section>
        </main>
    );
}