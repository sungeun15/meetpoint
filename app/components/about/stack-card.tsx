import type { AboutStackGroup } from "@/app/components/about/data";
import { aboutInter, aboutPoppins } from "@/app/components/about/fonts";

type StackCardProps = {
    group: AboutStackGroup;
};

export function StackCard({ group }: StackCardProps) {
    return (
        <div className="rounded-[18px] bg-white/10 px-4 py-4 backdrop-blur-sm ring-1 ring-white/10 sm:px-5 sm:py-5">
            <h3 className={`${aboutPoppins.className} text-[19px] leading-[1.2] sm:text-[20px]`}>
                {group.title}
            </h3>
            <p className={`${aboutInter.className} mt-2 text-[15px] leading-[1.8] text-white/90 sm:text-[16px]`}>
                {group.description}
            </p>
        </div>
    );
}