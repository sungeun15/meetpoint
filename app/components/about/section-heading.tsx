import { aboutInter, aboutPoppins } from "@/app/components/about/fonts";

type SectionHeadingProps = {
    title: string;
    description?: string;
    centered?: boolean;
    titleClassName?: string;
    descriptionClassName?: string;
};

export function SectionHeading({
    title,
    description,
    centered = false,
    titleClassName = "text-[30px] leading-[1.12] tracking-[-0.02em] text-[#1a202c] sm:text-[34px]",
    descriptionClassName = "mt-4 text-[16px] leading-[1.8] text-[#4a5568] sm:text-[17px]",
}: SectionHeadingProps) {
    return (
        <div className={centered ? "mx-auto max-w-[760px] text-center" : ""}>
            <h2 className={`${aboutPoppins.className} ${titleClassName}`}>{title}</h2>
            {description ? (
                <p className={`${aboutInter.className} ${descriptionClassName}`}>{description}</p>
            ) : null}
        </div>
    );
}