import Image from "next/image";
import Link from "next/link";
import { Abril_Fatface } from "next/font/google";

const abrilFatface = Abril_Fatface({
    weight: "400",
    subsets: ["latin"],
});

type BrandLogoProps = {
    className?: string;
};

export function BrandLogo({ className = "" }: BrandLogoProps) {
    return (
        <Link href="/" className={`flex items-center gap-[7px] text-black ${className}`.trim()}>
            <div className="relative size-[31px] shrink-0">
                <Image
                    src="/imports/Frame1-2/6bbd22ff4d1f77ee42786bef5cc5ea8b1b2a6028.png"
                    alt=""
                    fill
                    sizes="31px"
                    priority
                    className="-scale-y-100 rotate-180 object-cover"
                />
            </div>
            <span className={`${abrilFatface.className} text-[26px] leading-none sm:text-[28px]`}>
                meetpoint
            </span>
        </Link>
    );
}