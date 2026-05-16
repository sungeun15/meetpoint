"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
    authBodyFont,
    authDisplayFont,
    authHeadingFont,
} from "@/app/components/auth/fonts";
import {
    authCopyByMode,
    authFieldPlaceholder,
    getValidationMessage,
} from "@/app/components/auth/content";
import { AuthInput } from "@/app/components/auth/auth-input";
import type { AuthMode } from "@/app/components/auth/types";
import type { ApiResponse } from "@/lib/contracts/api";

type AuthFormCardProps = {
    mode: AuthMode;
};

type AuthApiSuccessData = {
    user: {
        id: string;
        nickname: string;
        lat: number | null;
        lng: number | null;
        locationUpdatedAt: string | null;
    };
};

export function AuthFormCard({ mode }: AuthFormCardProps) {
    const router = useRouter();
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverFeedbackMessage, setServerFeedbackMessage] = useState<string | null>(null);

    const copy = authCopyByMode[mode];

    const validationMessage = useMemo(
        () => getValidationMessage(mode, nickname, password, confirmPassword),
        [confirmPassword, mode, nickname, password],
    );

    const feedbackMessage = hasSubmitted ? validationMessage ?? serverFeedbackMessage : null;

    function handleNicknameChange(nextValue: string) {
        setNickname(nextValue);
        setServerFeedbackMessage(null);
    }

    function handlePasswordChange(nextValue: string) {
        setPassword(nextValue);
        setServerFeedbackMessage(null);
    }

    function handleConfirmPasswordChange(nextValue: string) {
        setConfirmPassword(nextValue);
        setServerFeedbackMessage(null);
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setHasSubmitted(true);
        setServerFeedbackMessage(null);

        if (validationMessage) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/auth/${mode}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nickname,
                    password,
                }),
            });
            const payload = (await response.json()) as ApiResponse<AuthApiSuccessData>;

            if (!response.ok || !payload.ok) {
                setServerFeedbackMessage(
                    payload.ok ? "인증 처리 중 오류가 발생했습니다." : payload.error.message,
                );
                return;
            }

            router.push("/friends");
            router.refresh();
        } catch {
            setServerFeedbackMessage("네트워크 오류로 인증 요청을 완료하지 못했습니다.");
        } finally {
            setIsSubmitting(false);
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
                <h2 className={`${authHeadingFont.className} text-[clamp(1.75rem,8.8vw,2.55rem)] font-extrabold leading-[1.02] text-[#111827]`}>
                    {copy.title}
                </h2>
                <p className={`${authDisplayFont.className} text-[clamp(1rem,5vw,1.45rem)] leading-tight text-[#6b7280]`}>
                    {copy.eyebrow}
                </p>
            </div>

            <form className="mx-auto mt-6 flex w-full max-w-[480px] flex-col gap-3.5 sm:mt-8 sm:gap-4" onSubmit={handleSubmit}>
                <AuthInput
                    type="text"
                    value={nickname}
                    onChange={handleNicknameChange}
                    placeholder={authFieldPlaceholder.nickname}
                    hasLeadingIcon
                />

                <AuthInput
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder={authFieldPlaceholder.password}
                />

                {mode === "signup" ? (
                    <AuthInput
                        type="password"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        placeholder={authFieldPlaceholder.confirmPassword}
                    />
                ) : null}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`${authDisplayFont.className} mt-1 inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-[5px] border-[3px] border-white bg-[#6c5ce7] text-[18px] font-semibold text-white transition-colors hover:bg-[#5b4bc6] disabled:cursor-not-allowed disabled:opacity-70 sm:h-[50px] sm:text-[20px]`}
                >
                    {isSubmitting ? `${copy.submitLabel}...` : `${copy.submitLabel} →`}
                </button>
            </form>

            {feedbackMessage ? (
                <div className="mx-auto mt-4 w-full max-w-[480px] px-1 text-center">
                    <p className={`${authBodyFont.className} text-[13px] leading-[1.6] text-[#c4325b] sm:text-sm`}>
                        {feedbackMessage}
                    </p>
                </div>
            ) : null}

            <div className="mt-5 text-center sm:mt-6">
                <Link href={copy.helperHref} className={`${authDisplayFont.className} text-[15px] text-[#6c5ce7] underline underline-offset-2 transition hover:text-[#5b4bc6] sm:text-[16px]`}>
                    {copy.helperText}
                </Link>
            </div>
        </div>
    );
}