import { GradientActionLink } from "@/app/components/gradient-action-link";
import { featureCards } from "@/app/components/features/data";
import { FeatureCard } from "@/app/components/features/feature-card";
import { featuresInter, featuresPoppins } from "@/app/components/features/fonts";

export function FeaturesContent() {
    return (
        <section className="mx-auto flex w-full max-w-[1440px] flex-col px-4 pb-14 pt-8 sm:px-8 sm:pb-20 sm:pt-14 md:px-10 md:pt-16 lg:px-8 lg:pb-24 lg:pt-20">
            <div className="mx-auto flex max-w-[900px] flex-col items-center text-center sm:max-w-[820px]">
                <p
                    className={`${featuresInter.className} rounded-full bg-white/80 px-4 py-2 text-[12px] font-medium uppercase tracking-[0.2em] text-[#5b43d6] shadow-[0px_8px_24px_rgba(91,67,214,0.12)] sm:text-[14px]`}
                >
                    MeetPoint Features
                </p>
                <h1
                    className={`${featuresPoppins.className} mt-5 text-[clamp(2.2rem,9vw,4rem)] leading-[1.08] tracking-[-0.03em] text-[#24145f] sm:mt-6`}
                >
                    Core Features for Smarter Meetups
                </h1>
                <p
                    className={`${featuresInter.className} mt-5 max-w-[44rem] text-[16px] leading-[1.8] text-[#4a5568] sm:mt-6 sm:text-[19px] lg:text-[22px]`}
                >
                    Share locations manually, compare positions on the map, and explore top midpoint-based recommendations in one flow.
                </p>
            </div>

            <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 xl:gap-8">
                {featureCards.map((featureCard) => (
                    <FeatureCard key={featureCard.title} featureCard={featureCard} />
                ))}
            </div>

            <div className="mt-10 flex justify-center sm:mt-14 lg:mt-16">
                <GradientActionLink
                    href="/signup"
                    className={`${featuresInter.className} inline-flex min-h-[56px] w-full cursor-pointer items-center justify-center rounded-[10px] px-6 py-4 text-[15px] font-semibold text-[#fafafa] shadow-[0px_10px_28px_rgba(36,20,95,0.18)] transition-transform hover:-translate-y-0.5 sm:w-auto sm:min-w-[240px] sm:px-8 sm:text-[16px]`}
                >
                    Get Started Now
                </GradientActionLink>
            </div>
        </section>
    );
}