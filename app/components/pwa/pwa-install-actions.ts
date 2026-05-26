import type { PlatformContext } from "@/app/components/pwa/pwa-install-copy";

export type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{
        outcome: "accepted" | "dismissed";
        platform: string;
    }>;
};

export type InstallActionKind = "prompt" | "manual" | "unsupported";

export type InstallActionResult = {
    clearDeferredPrompt: boolean;
    hideBanner: boolean;
    tone: "success" | "neutral";
    message: string;
};

export function getInstallActionKind(
    platformContext: PlatformContext,
    deferredPrompt: BeforeInstallPromptEvent | null,
): InstallActionKind {
    if (deferredPrompt) {
        return "prompt";
    }

    if (platformContext.isIos || platformContext.isAndroid) {
        return "manual";
    }

    return "unsupported";
}

function getManualInstallMessage(platformContext: PlatformContext) {
    if (platformContext.isIphoneSafari) {
        return "Open Safari share menu and choose Add to Home Screen to install MeetPoint.";
    }

    if (platformContext.isIos) {
        return "Use your browser share menu and choose Add to Home Screen to install MeetPoint.";
    }

    if (platformContext.isAndroid) {
        return "Use your browser menu and choose Install app or Add to Home Screen to install MeetPoint.";
    }

    return "Install is not available in this browser right now.";
}

export async function runInstallAction(
    platformContext: PlatformContext,
    deferredPrompt: BeforeInstallPromptEvent | null,
): Promise<InstallActionResult> {
    const actionKind = getInstallActionKind(platformContext, deferredPrompt);

    if (actionKind === "manual") {
        return {
            clearDeferredPrompt: false,
            hideBanner: false,
            tone: "neutral",
            message: getManualInstallMessage(platformContext),
        };
    }

    if (actionKind === "unsupported") {
        return {
            clearDeferredPrompt: false,
            hideBanner: false,
            tone: "neutral",
            message: "Install prompt is only available in supported desktop browsers like Chrome or Edge.",
        };
    }

    if (!deferredPrompt) {
        return {
            clearDeferredPrompt: false,
            hideBanner: false,
            tone: "neutral",
            message: "Install prompt is not ready yet. Please try again in a moment.",
        };
    }

    await deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
        return {
            clearDeferredPrompt: true,
            hideBanner: true,
            tone: "success",
            message: "설치를 시작했어요. 브라우저가 MeetPoint를 앱처럼 준비하고 있습니다.",
        };
    }

    return {
        clearDeferredPrompt: true,
        hideBanner: false,
        tone: "neutral",
        message: "지금은 설치하지 않아도 괜찮아요. 필요할 때 배너나 브라우저 메뉴에서 다시 설치할 수 있어요.",
    };
}