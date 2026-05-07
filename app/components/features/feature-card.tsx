import type { FeatureCardItem } from "@/app/components/features/data";
import { featuresInter, featuresPoppins } from "@/app/components/features/fonts";

type FeatureCardProps = {
    featureCard: FeatureCardItem;
};

export function FeatureCard({ featureCard }: FeatureCardProps) {
    return (
        <article className="flex h-full flex-col items-center rounded-[22px] bg-white px-5 py-6 text-center shadow-[0px_16px_40px_rgba(36,20,95,0.12)] ring-1 ring-black/5 transition-transform duration-200 hover:-translate-y-1 sm:rounded-[24px] sm:px-7 sm:py-8 lg:px-8 lg:py-9">
            <div className="text-[40px] leading-none sm:text-[46px] lg:text-[48px]">{featureCard.icon}</div>
            <h2
                className={`${featuresPoppins.className} mt-4 text-[24px] leading-[1.18] text-[#1a202c] sm:mt-5 sm:text-[27px] lg:text-[28px]`}
            >
                {featureCard.title}
            </h2>
            <p
                className={`${featuresInter.className} mt-3 max-w-[30ch] text-[15px] leading-[1.75] text-[#4a5568] sm:mt-4 sm:max-w-none sm:text-[16px] lg:text-[18px]`}
            >
                {featureCard.description}
            </p>
        </article>
    );
}