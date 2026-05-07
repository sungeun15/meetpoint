import type { AboutValue } from "@/app/components/about/data";
import { aboutInter, aboutPoppins } from "@/app/components/about/fonts";

type ValueCardProps = {
    value: AboutValue;
};

export function ValueCard({ value }: ValueCardProps) {
    return (
        <article className="flex h-full flex-col rounded-[18px] bg-white px-5 py-5 shadow-[0px_12px_32px_rgba(0,0,0,0.08)] ring-1 ring-black/5 sm:rounded-[20px] sm:px-6 sm:py-7">
            <div className="text-[34px] leading-none sm:text-[40px]">{value.icon}</div>
            <h3 className={`${aboutPoppins.className} mt-4 text-[22px] leading-[1.2] text-[#1a202c] sm:text-[24px]`}>
                {value.title}
            </h3>
            <p className={`${aboutInter.className} mt-3 max-w-[30ch] text-[15px] leading-[1.8] text-[#4a5568] sm:max-w-none sm:text-[16px]`}>
                {value.description}
            </p>
        </article>
    );
}