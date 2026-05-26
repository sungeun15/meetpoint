"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { runInstallAction } from "@/app/components/pwa/pwa-install-actions";
import { buildInstallCopy } from "@/app/components/pwa/pwa-install-copy";
import { usePwaInstallState } from "@/app/components/pwa/use-pwa-install-state";

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const SEVEN_DAYS_IN_MS = 7 * ONE_DAY_IN_MS;

type InstallBannerToastTone = "success" | "neutral";

type InstallBannerToast = {
    id: number;
    message: string;
    tone: InstallBannerToastTone;
};

export function PwaInstallBanner() {
    const [toast, setToast] = useState<InstallBannerToast | null>(null);
    const {
        clearDeferredPrompt,
        deferredPrompt,
        dismiss,
        hideBanner,
        installActionKind,
        isVisible,
        platformContext,
    } = usePwaInstallState({
        onInstalled: () => {
            setToast({
                id: Date.now(),
                message: "MeetPoint를 앱처럼 바로 열 수 있도록 설치가 완료됐어요.",
                tone: "success",
            });
        },
    });

    useEffect(() => {
        if (!toast) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setToast(null);
        }, 2600);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [toast]);

    async function handleInstall() {
        if (!platformContext) {
            return;
        }

        const result = await runInstallAction(platformContext, deferredPrompt);

        if (result.clearDeferredPrompt) {
            clearDeferredPrompt();
        }

        if (result.hideBanner) {
            hideBanner();
        }

        setToast({
            id: Date.now(),
            message: result.message,
            tone: result.tone,
        });
    }

    if (!platformContext || (!isVisible && !toast)) {
        return null;
    }

    const installCopy = buildInstallCopy(platformContext, installActionKind === "prompt");
    const isDesktopLayout = platformContext.isDesktop;

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-3 z-50 flex justify-center px-2.5 sm:bottom-4 sm:px-4 md:inset-x-auto md:right-5 md:justify-end md:px-0 lg:right-6">
            <div className="flex w-full max-w-104 flex-col items-center gap-2 sm:max-w-88 md:w-80 md:items-end">
                {toast ? (
                    <div className="pointer-events-none w-full px-1 md:px-0">
                        <div
                            role="status"
                            aria-live="polite"
                            className={`install-banner-toast rounded-[20px] border px-4 py-3 shadow-[0px_18px_40px_rgba(36,20,95,0.22)] backdrop-blur-md ${toast.tone === "success"
                                ? "border-[#d8d7ff] bg-[rgba(27,29,74,0.92)] text-white"
                                : "border-[#e6dbff] bg-[rgba(255,255,255,0.92)] text-[#2f236d]"
                                }`}
                        >
                            <p className="font-pretendard text-[12px] leading-[1.55] break-keep sm:text-[13px]">
                                {toast.message}
                            </p>
                        </div>
                    </div>
                ) : null}

                {isVisible ? (
                    <aside className={`install-banner-enter pointer-events-auto w-full overflow-hidden border border-[rgba(119,110,214,0.18)] bg-[radial-gradient(circle_at_top_left,rgba(118,99,255,0.13),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.97)_0%,rgba(245,240,255,0.98)_52%,rgba(233,238,255,0.98)_100%)] shadow-[0px_24px_60px_rgba(36,20,95,0.18)] backdrop-blur-xl ${isDesktopLayout ? "rounded-3xl p-3" : "rounded-[26px] p-3 sm:rounded-[28px] sm:p-4"}`}>
                        {isDesktopLayout ? (
                            <>
                                <div className="flex items-start gap-2.5">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white shadow-[0px_14px_28px_rgba(61,99,234,0.18)]">
                                        <Image
                                            src="/imports/Frame1-2/meetpoint-logo.png"
                                            alt=""
                                            aria-hidden="true"
                                            width={28}
                                            height={28}
                                            className="h-7 w-7 object-cover -scale-y-100 rotate-180"
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="font-pretendard text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5a53b4]">
                                            {installCopy.badge}
                                        </p>
                                        {installCopy.title ? (
                                            <h2 className="mt-1 font-pretendard text-[14px] font-semibold leading-[1.35] break-keep text-[#24145f]">
                                                {installCopy.title}
                                            </h2>
                                        ) : null}

                                        {installCopy.description ? (
                                            <p className="mt-1 font-pretendard text-[11px] leading-[1.45] break-keep text-[#3b3f62]">
                                                {installCopy.description}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>

                                {installCopy.hint ? (
                                    <div className="mt-2.5 rounded-[18px] border border-white/70 bg-[rgba(255,255,255,0.78)] px-2.5 py-2 shadow-[inset_0px_1px_0px_rgba(255,255,255,0.78)]">
                                        <p className="font-pretendard text-[10px] font-medium leading-normal break-keep text-[#312970]">
                                            {installCopy.hint}
                                        </p>
                                    </div>
                                ) : null}
                            </>
                        ) : null}

                        <div className={`mt-2.5 ${isDesktopLayout ? "flex flex-col gap-2" : "grid grid-cols-2 gap-2"}`}>
                            {isDesktopLayout && installCopy.installLabel ? (
                                <button
                                    type="button"
                                    className="font-pretendard inline-flex min-h-9 w-full items-center justify-center rounded-[16px] bg-[linear-gradient(145deg,#24145f_0%,#3d63ea_58%,#6c5ce7_100%)] px-3.5 text-[11px] font-semibold text-white shadow-[0px_10px_22px_rgba(61,99,234,0.22)] transition-transform duration-200 ease-out hover:-translate-y-0.5"
                                    onClick={() => {
                                        void handleInstall();
                                    }}
                                >
                                    {installCopy.installLabel}
                                </button>
                            ) : null}

                            {!isDesktopLayout && installCopy.installLabel ? (
                                <button
                                    type="button"
                                    className="font-pretendard col-span-2 inline-flex min-h-11 items-center justify-center rounded-[18px] bg-[linear-gradient(145deg,#24145f_0%,#3d63ea_58%,#6c5ce7_100%)] px-4 text-[12px] font-semibold text-white shadow-[0px_12px_28px_rgba(61,99,234,0.28)] transition-transform duration-200 ease-out hover:-translate-y-0.5"
                                    onClick={() => {
                                        void handleInstall();
                                    }}
                                >
                                    {installCopy.installLabel}
                                </button>
                            ) : null}

                            <div className={`${isDesktopLayout ? "grid grid-cols-2 gap-1.5" : "contents"}`}>
                                <button
                                    type="button"
                                    className={`font-pretendard inline-flex items-center justify-center border border-[#d8d3f6] bg-white/88 font-medium text-[#4d4f6c] transition-colors duration-200 hover:border-[#aba2f0] hover:text-[#24145f] ${isDesktopLayout ? "min-h-9 rounded-[14px] px-3 text-[10px]" : "min-h-[3.25rem] rounded-[18px] px-3.5 py-3 text-[11px] shadow-[0px_10px_20px_rgba(36,20,95,0.06)] sm:text-[12px]"}`}
                                    onClick={() => dismiss(ONE_DAY_IN_MS)}
                                >
                                    Hide for today
                                </button>

                                <button
                                    type="button"
                                    className={`font-pretendard inline-flex items-center justify-center border border-[#d8d3f6] bg-white/88 font-medium text-[#4d4f6c] transition-colors duration-200 hover:border-[#aba2f0] hover:text-[#24145f] ${isDesktopLayout ? "min-h-9 rounded-[14px] px-3 text-[10px]" : "min-h-[3.25rem] rounded-[18px] px-3.5 py-3 text-[11px] shadow-[0px_10px_20px_rgba(36,20,95,0.06)] sm:text-[12px]"}`}
                                    onClick={() => dismiss(SEVEN_DAYS_IN_MS)}
                                >
                                    Hide for 7 days
                                </button>
                            </div>
                        </div>
                    </aside>
                ) : null}
            </div>
        </div>
    );
}