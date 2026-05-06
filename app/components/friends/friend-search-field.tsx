import Image from "next/image";

import { friendsDisplayFont } from "./fonts";

type FriendSearchFieldProps = {
    value: string;
    onChange: (nextValue: string) => void;
    placeholder: string;
    className?: string;
    inputClassName?: string;
};

export function FriendSearchField({
    value,
    onChange,
    placeholder,
    className,
    inputClassName,
}: FriendSearchFieldProps) {
    return (
        <label className={className ? `relative block ${className}` : "relative block"}>
            <Image
                alt="Search icon"
                src="/imports/Frame3/98fc8a680b0a82f3349ebefc75d06755f7338b44.png"
                width={28}
                height={28}
                className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 object-cover sm:left-4 sm:h-6 sm:w-6 lg:h-7 lg:w-7"
            />
            <input
                type="text"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className={`${friendsDisplayFont.className} h-12 w-full rounded-[12px] border-2 border-[#d1d5db] bg-white px-11 text-[16px] text-[#111827] outline-none transition focus:border-[#8b7cf6] focus:shadow-[0_0_0_4px_rgba(108,92,231,0.08)] sm:h-[52px] sm:px-12 sm:text-[18px] lg:h-14 lg:px-14 lg:text-[22px] ${inputClassName ?? ""}`}
            />
        </label>
    );
}