import { GradientActionLink } from "@/app/components/gradient-action-link";
import { aboutStackGroups, aboutValues } from "@/app/components/about/data";
import { aboutInter, aboutPoppins } from "@/app/components/about/fonts";
import { SectionHeading } from "@/app/components/about/section-heading";
import { StackCard } from "@/app/components/about/stack-card";
import { ValueCard } from "@/app/components/about/value-card";

export function AboutContent() {
    return (
        <section className="mx-auto flex w-full max-w-[1440px] flex-col px-4 pb-14 pt-8 sm:px-6 sm:pb-20 sm:pt-12 md:px-10 md:pt-16 lg:px-8 lg:pb-24 lg:pt-20">
            <div className="mx-auto flex max-w-[960px] flex-col items-center text-center sm:max-w-[820px] lg:max-w-[960px]">
                <p
                    className={`${aboutInter.className} rounded-full bg-white/80 px-4 py-2 text-[12px] font-medium uppercase tracking-[0.2em] text-[#5b43d6] shadow-[0px_8px_24px_rgba(91,67,214,0.12)] sm:text-[14px]`}
                >
                    About MeetPoint
                </p>
                <h1
                    className={`${aboutPoppins.className} mt-5 text-[clamp(2.3rem,9vw,4rem)] leading-[1.12] tracking-[-0.022em] text-[#24145f] sm:mt-6`}
                >
                    One flow for fair meetups, whether you meet now or later.
                </h1>
                <p
                    className={`${aboutInter.className} mt-5 max-w-[48rem] text-[16px] leading-[1.8] text-[#4a5568] sm:mt-6 sm:text-[19px] lg:text-[22px]`}
                >
                    MeetPoint combines chat, current location sharing, departure point selection, and fair recommendation logic into one connected meetup planning experience.
                </p>
            </div>

            <div className="mt-10 rounded-[22px] bg-white px-5 py-6 shadow-[0px_14px_36px_rgba(0,0,0,0.08)] ring-1 ring-black/5 sm:mt-12 sm:rounded-[24px] sm:px-8 sm:py-8 lg:px-10 lg:py-10">
                <SectionHeading
                    title="Our Mission"
                    titleClassName="text-[28px] leading-[1.12] text-[#1a202c] sm:text-[32px]"
                />
                <p className={`${aboutInter.className} mt-4 text-[16px] leading-[1.9] text-[#4a5568] sm:text-[17px] lg:text-[18px]`}>
                    Planning a meetup should not require switching between chat apps, maps, and place search tools. That fragmented flow slows people down and makes even simple plans harder than they should be.
                </p>
                <p className={`${aboutInter.className} mt-4 text-[16px] leading-[1.9] text-[#4a5568] sm:text-[17px] lg:text-[18px]`}>
                    MeetPoint brings those steps together so users can talk with a friend, choose whether they are meeting now or later, set the right departure inputs, and compare suitable places from a single product flow.
                </p>
                <p className={`${aboutInter.className} mt-4 text-[16px] leading-[1.9] text-[#4a5568] sm:text-[17px] lg:text-[18px]`}>
                    That mission is reflected in six product values: integration, fairness, flexibility, simplicity, practicality, and clarity.
                </p>
            </div>

            <div className="mt-10 sm:mt-12 lg:mt-14">
                <SectionHeading
                    title="Core Values"
                    description="Six product values guide the experience so meetup planning stays connected, balanced, flexible, lightweight, practical, and easy to understand."
                    centered
                />

                <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6 xl:gap-8">
                    {aboutValues.map((value) => (
                        <ValueCard key={value.title} value={value} />
                    ))}
                </div>
            </div>

            <div className="mt-10 rounded-[22px] bg-[linear-gradient(135deg,#6675f7_0%,#57007b_100%)] px-5 py-6 text-white shadow-[0px_16px_42px_rgba(87,0,123,0.24)] sm:mt-12 sm:rounded-[24px] sm:px-8 sm:py-8 lg:px-10 lg:py-10">
                <SectionHeading
                    title="Technology Stack"
                    titleClassName="text-[28px] leading-[1.12] text-white sm:text-[32px]"
                />
                <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-6">
                    {aboutStackGroups.map((group) => (
                        <StackCard key={group.title} group={group} />
                    ))}
                </div>
            </div>

            <div className="mt-10 flex flex-col items-center rounded-[22px] bg-white px-5 py-7 text-center shadow-[0px_14px_36px_rgba(0,0,0,0.08)] ring-1 ring-black/5 sm:mt-12 sm:rounded-[24px] sm:px-8 sm:py-8 lg:px-10 lg:py-10">
                <SectionHeading
                    title="Ready to Get Started?"
                    description="Start with signup, connect with friends, and plan meetups with mode-aware, category-aware recommendations."
                    centered
                    titleClassName="text-[28px] leading-[1.12] text-[#1a202c] sm:text-[32px]"
                    descriptionClassName="mt-4 max-w-[38rem] text-[16px] leading-[1.8] text-[#4a5568] sm:text-[17px]"
                />
                <GradientActionLink
                    href="/signup"
                    className={`${aboutInter.className} mt-6 inline-flex min-h-[56px] w-full cursor-pointer items-center justify-center rounded-[10px] px-6 py-4 text-[15px] font-semibold text-[#fafafa] shadow-[0px_10px_28px_rgba(36,20,95,0.18)] transition-transform hover:-translate-y-0.5 sm:w-auto sm:min-w-[240px] sm:px-8 sm:text-[16px]`}
                >
                    Join MeetPoint and Plan Better
                </GradientActionLink>
            </div>
        </section>
    );
}