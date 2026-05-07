import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

import { friendsGradientBackground } from "../friends/data";

type ChatSectionCardProps = {
    children: ReactNode;
    className?: string;
    tone?: "white" | "accent";
};

type ChatActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    className?: string;
    variant?: "outline" | "primary" | "accent";
};

function mergeClassNames(...classNames: Array<string | false | null | undefined>) {
    return classNames.filter(Boolean).join(" ");
}

export function ChatSectionCard({ children, className, tone = "white" }: ChatSectionCardProps) {
    const toneClassName = tone === "accent"
        ? "bg-[#dcd2ff] shadow-[0px_18px_44px_rgba(52,41,104,0.12)]"
        : "bg-white shadow-[0px_18px_44px_rgba(52,41,104,0.14)]";

    return (
        <section className={mergeClassNames("rounded-[22px] sm:rounded-[24px] lg:rounded-[26px]", toneClassName, className)}>
            {children}
        </section>
    );
}

export function ChatActionButton({
    children,
    className,
    variant = "primary",
    style,
    type = "button",
    ...buttonProps
}: ChatActionButtonProps) {
    const variantClassName = {
        outline: "border-2 border-[#6c5ce7] bg-white text-[#6c5ce7] transition-[background-color,transform,box-shadow] duration-200 hover:bg-[#f7f4ff] hover:shadow-[0px_10px_24px_rgba(108,92,231,0.08)]",
        primary: "border-[3px] border-white text-white shadow-[0px_10px_24px_rgba(108,92,231,0.18)] transition-opacity hover:opacity-95",
        accent: "border border-white/50 bg-[linear-gradient(198.712deg,#6675f7_0%,#57007b_100%)] text-white shadow-[0px_16px_32px_rgba(87,0,123,0.22)] transition-[transform,box-shadow,opacity] duration-200 ease-out hover:-translate-y-[1px] hover:shadow-[0px_20px_36px_rgba(87,0,123,0.26)] hover:opacity-100",
    }[variant];

    const buttonStyle: CSSProperties | undefined = variant === "primary"
        ? { ...style, backgroundImage: friendsGradientBackground }
        : style;

    return (
        <button
            {...buttonProps}
            type={type}
            className={mergeClassNames(
                "inline-flex cursor-pointer items-center justify-center",
                variantClassName,
                className,
            )}
            style={buttonStyle}
        >
            {children}
        </button>
    );
}