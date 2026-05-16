import Image from "next/image";

import { authDisplayFont } from "@/app/components/auth/fonts";

type AuthInputProps = {
    type: "text" | "password";
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    hasLeadingIcon?: boolean;
};

const inputClassName =
    "h-12 w-full rounded-[10px] border border-[#d5d9e3] bg-[#fcfcff] text-[17px] text-[#111827] placeholder:text-[#9ca3af] outline-none transition focus:border-[#8b7cf6] focus:bg-white focus:shadow-[0_0_0_4px_rgba(108,92,231,0.08)] sm:h-[50px] sm:text-[20px]";

export function AuthInput({
    type,
    value,
    onChange,
    placeholder,
    hasLeadingIcon = false,
}: AuthInputProps) {
    return (
        <div className="relative">
            {hasLeadingIcon ? (
                <span className="pointer-events-none absolute left-3.5 top-1/2 block -translate-y-1/2 sm:left-4">
                    <Image
                        alt="Input icon"
                        src="/imports/Frame2-2/9622d708da7e714eca3bfff8ef23736265f03b13.png"
                        width={28}
                        height={28}
                        sizes="(max-width: 640px) 24px, 28px"
                        className="h-6 w-6 object-cover sm:h-7 sm:w-7"
                    />
                </span>
            ) : null}

            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className={`${authDisplayFont.className} ${inputClassName} ${hasLeadingIcon ? "px-11 sm:px-[46px]" : "px-4 sm:px-[24px]"}`}
            />
        </div>
    );
}