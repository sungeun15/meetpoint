"use client";

import Link from "next/link";
import Image from "next/image";
import { Coda, Inter } from "next/font/google";
import { useMemo, useState } from "react";

import {
    authCopyByMode,
    authFieldPlaceholder,
    getValidationMessage,
} from "@/app/components/auth/content";
import { AuthInput } from "@/app/components/auth/auth-input";
import type { AuthMode } from "@/app/components/auth/types";

const inter = Inter({
    weight: ["400", "500", "600"],
    subsets: ["latin"],
});

const coda = Coda({
    weight: ["400", "800"],
    subsets: ["latin"],
});

type AuthFormCardProps = {
    mode: AuthMode;
};

export function AuthFormCard({ mode }: AuthFormCardProps) {
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const copy = authCopyByMode[mode];

    const validationMessage = useMemo(
        () => getValidationMessage(mode, nickname, password, confirmPassword),
        [confirmPassword, mode, nickname, password],
    );

    const feedbackMessage = hasSubmitted ? validationMessage : null;

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setHasSubmitted(true);

        if (validationMessage) {
            return;
        }
    }

    return (
        <div className="relative mx-auto w-full max-w-[640px] rounded-[18px] bg-white px-4 py-6 shadow-[0px_18px_44px_rgba(52,41,104,0.16)] sm:rounded-[20px] sm:px-8 sm:py-9 md:px-12 md:py-11">
            <div className="mb-5 flex justify-center sm:mb-6">
                <Image
                    alt="MeetPoint accent"
                    src="/imports/Frame2-2/5e66f4e394598c0f1398fa73d367b84a954e028a.png"
                    width={92}
                    height={92}
                    sizes="(max-width: 640px) 76px, 92px"
                    className="h-[76px] w-[76px] object-cover sm:h-[92px] sm:w-[92px]"
                />
            </div>

            <div className="space-y-2 text-center sm:space-y-3">
                <h2 className={`${coda.className} text-[clamp(1.75rem,8.8vw,2.55rem)] font-extrabold leading-[0.96] text-[#111827]`}>
                    {copy.title}
                </h2>
                <p className={`${coda.className} text-[clamp(1rem,5vw,1.45rem)] leading-tight text-[#6b7280]`}>
                    {copy.eyebrow}
                </p>
            </div>

            <form className="mx-auto mt-6 flex w-full max-w-[480px] flex-col gap-3.5 sm:mt-8 sm:gap-4" onSubmit={handleSubmit}>
                <AuthInput
                    type="text"
                    value={nickname}
                    onChange={setNickname}
                    placeholder={authFieldPlaceholder.nickname}
                    hasLeadingIcon
                />

                <AuthInput
                    type="password"
                    value={password}
                    onChange={setPassword}
                    placeholder={authFieldPlaceholder.password}
                />

                {mode === "signup" ? (
                    <AuthInput
                        type="password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        placeholder={authFieldPlaceholder.confirmPassword}
                    />
                ) : null}

                <button
                    type="submit"
                    className={`${inter.className} mt-1 inline-flex h-12 w-full items-center justify-center rounded-[5px] border-[3px] border-white text-[18px] font-semibold text-white transition-colors hover:bg-[#5b4bc6] sm:h-[50px] sm:text-[20px] cursor-pointer `}
                    style={{ backgroundColor: "#6c5ce7" }}
                >
                    {copy.submitLabel} →
                </button>
            </form>

            {feedbackMessage ? (
                <div className="mx-auto mt-4 w-full max-w-[480px] px-1 text-center">
                    <p className={`${inter.className} text-[13px] leading-[1.6] text-[#c4325b] sm:text-sm`}>
                        {feedbackMessage}
                    </p>
                </div>
            ) : null}

            <div className="mt-5 text-center sm:mt-6">
                <Link href={copy.helperHref} className={`${coda.className} text-[15px] text-[#6c5ce7] underline underline-offset-2 transition hover:text-[#5b4bc6] sm:text-[16px]`}>
                    {copy.helperText}
                </Link>
            </div>
        </div>
    );
}