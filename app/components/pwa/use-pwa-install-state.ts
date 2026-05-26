import { useEffect, useEffectEvent, useState } from "react";

import type { PlatformContext } from "@/app/components/pwa/pwa-install-copy";
import type { BeforeInstallPromptEvent, InstallActionKind } from "@/app/components/pwa/pwa-install-actions";
import { getInstallActionKind } from "@/app/components/pwa/pwa-install-actions";
import {
    clearDismissUntil,
    getDismissUntil,
    hasRecentInstallSignal,
    markAppInstalled,
    markStandaloneLaunch,
    readInstallSnapshot,
    saveDismissUntil,
} from "@/app/components/pwa/pwa-install-storage";

type UsePwaInstallStateOptions = {
    onInstalled?: () => void;
};

function isStandaloneMode() {
    if (typeof window === "undefined") {
        return false;
    }

    const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };

    return window.matchMedia("(display-mode: standalone)").matches || Boolean(navigatorWithStandalone.standalone);
}

function detectPlatformContext(): PlatformContext {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent);
    const isIphone = /iphone/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/crios|fxios|edgios|gsa/.test(userAgent);
    const isAndroid = /android/.test(userAgent);

    return {
        isIos,
        isIphoneSafari: isIphone && isSafari,
        isAndroid,
        isDesktop: !isIos && !isAndroid,
    };
}

export function usePwaInstallState(options: UsePwaInstallStateOptions = {}) {
    const [isVisible, setIsVisible] = useState(false);
    const [platformContext, setPlatformContext] = useState<PlatformContext | null>(null);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    const notifyInstalled = useEffectEvent(() => {
        options.onInstalled?.();
    });

    useEffect(() => {
        const nextPlatformContext = detectPlatformContext();
        const mediaQuery = window.matchMedia("(display-mode: standalone)");

        const animationFrameId = window.requestAnimationFrame(() => {
            setPlatformContext(nextPlatformContext);
            const snapshot = readInstallSnapshot();

            if (isStandaloneMode()) {
                markStandaloneLaunch();
                setIsVisible(false);
                setDeferredPrompt(null);
                return;
            }

            if (hasRecentInstallSignal(snapshot)) {
                setIsVisible(false);
                setDeferredPrompt(null);
                return;
            }

            setIsVisible(snapshot.dismissUntil === null);
        });

        function handleBeforeInstallPrompt(event: Event) {
            event.preventDefault();
            const snapshot = readInstallSnapshot();
            setDeferredPrompt(event as BeforeInstallPromptEvent);

            if (!snapshot.dismissUntil && !isStandaloneMode() && !hasRecentInstallSignal(snapshot)) {
                setIsVisible(true);
            }
        }

        function handleAppInstalled() {
            markAppInstalled();
            clearDismissUntil();
            setDeferredPrompt(null);
            setIsVisible(false);
            notifyInstalled();
        }

        function handleDisplayModeChange() {
            const snapshot = readInstallSnapshot();

            if (isStandaloneMode()) {
                markStandaloneLaunch();
                setIsVisible(false);
                setDeferredPrompt(null);
                return;
            }

            if (hasRecentInstallSignal(snapshot)) {
                setIsVisible(false);
                setDeferredPrompt(null);
                return;
            }

            if (!snapshot.dismissUntil) {
                setIsVisible(true);
            }
        }

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", handleAppInstalled);

        if (typeof mediaQuery.addEventListener === "function") {
            mediaQuery.addEventListener("change", handleDisplayModeChange);
        } else {
            mediaQuery.addListener(handleDisplayModeChange);
        }

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.removeEventListener("appinstalled", handleAppInstalled);

            if (typeof mediaQuery.removeEventListener === "function") {
                mediaQuery.removeEventListener("change", handleDisplayModeChange);
            } else {
                mediaQuery.removeListener(handleDisplayModeChange);
            }
        };
    }, []);

    function dismiss(duration: number) {
        saveDismissUntil(getDismissUntil(duration));
        setIsVisible(false);
    }

    function hideBanner() {
        setIsVisible(false);
    }

    function clearDeferredPrompt() {
        setDeferredPrompt(null);
    }

    const installActionKind: InstallActionKind | null = platformContext
        ? getInstallActionKind(platformContext, deferredPrompt)
        : null;

    return {
        clearDeferredPrompt,
        deferredPrompt,
        dismiss,
        hideBanner,
        installActionKind,
        isVisible,
        platformContext,
    };
}