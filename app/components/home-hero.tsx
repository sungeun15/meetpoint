import Image from "next/image";
import { Inter, Poppins } from "next/font/google";

import { GradientActionLink } from "@/app/components/gradient-action-link";

const inter = Inter({
    weight: ["300", "400", "500", "600"],
    subsets: ["latin"],
});

const poppins = Poppins({
    weight: ["500"],
    subsets: ["latin"],
});

const heroCopy = {
    title: "Meet smarter, meet faster.",
    cta: "Let's get started!",
};

export function HomeHero() {
    return (
        <section className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-10 px-5 py-10 sm:gap-12 sm:px-8 sm:py-14 md:gap-14 md:px-10 md:py-16 lg:min-h-[calc(100vh-84px)] lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,560px)] lg:gap-10 lg:px-8 lg:py-16 xl:py-20">
            <div className="max-w-[760px] text-center md:max-w-[900px] md:text-left lg:self-center lg:pt-0">
                <h1 className={`${poppins.className} text-[clamp(2.75rem,9vw,4.5rem)] leading-[1.04] tracking-[-0.03em] text-[#24145f] md:max-w-[10.5ch] md:text-[clamp(3.4rem,7vw,4.9rem)] lg:max-w-none`}>
                    {heroCopy.title}
                </h1>

                <p className={`${inter.className} mx-auto mt-8 max-w-[720px] text-[clamp(1.35rem,4.7vw,2.25rem)] font-normal leading-[1.65] text-[#2b2373] sm:mt-10 md:mx-0 md:mt-11 md:max-w-[26ch] md:text-[clamp(1.55rem,3.6vw,2.1rem)] md:leading-[1.68] lg:mt-14 lg:max-w-none lg:leading-[1.72]`}>
                    Share your location, chat with friends,
                    <br className="hidden sm:block" />
                    <span className="sm:hidden"> </span>
                    and find the perfect meeting spot in seconds.
                </p>

                <GradientActionLink
                    href="/friends"
                    className={`${inter.className} mt-10 inline-flex w-full items-center justify-center rounded-[5px] bg-[#3d63ea] px-[30px] py-[19px] text-[14px] font-semibold leading-[14px] text-[#fafafa] shadow-[0px_4px_24.5px_rgba(0,0,0,0.15)] transition-transform hover:-translate-y-0.5 sm:mt-12 sm:w-auto md:mt-14 md:min-w-[220px] lg:mt-[68px]`}
                >
                    {heroCopy.cta}
                </GradientActionLink>
            </div>

            <div className="relative mx-auto flex w-full max-w-[320px] items-center justify-center sm:max-w-[420px] md:max-w-[460px] lg:max-w-[560px] lg:self-center">
                <Image
                    src="/home_check.svg"
                    alt="MeetPoint home illustration"
                    width={600}
                    height={600}
                    priority
                    className="h-auto w-full object-contain"
                />
            </div>
        </section>
    );
}