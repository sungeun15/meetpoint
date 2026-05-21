import { useEffect, useRef } from "react";

import { friendsBodyFont } from "../friends/fonts";
import { mergeClassNames } from "./class-names";

export type ChatFloatingToastItem = {
    id: number;
    message: string;
};

type ChatFloatingToastProps = {
    toast: ChatFloatingToastItem | null;
    onDismiss: () => void;
    containerClassName?: string;
};

export function ChatFloatingToast({
    toast,
    onDismiss,
    containerClassName,
}: ChatFloatingToastProps) {
    const onDismissRef = useRef(onDismiss);
    const toastId = toast?.id ?? null;

    useEffect(() => {
        onDismissRef.current = onDismiss;
    }, [onDismiss]);

    useEffect(() => {
        if (toastId === null) {
            return;
        }

        const dismissTimeoutId = window.setTimeout(() => {
            onDismissRef.current();
        }, 2420);

        return () => {
            window.clearTimeout(dismissTimeoutId);
        };
    }, [toastId]);

    if (!toast) {
        return null;
    }

    return (
        <div className={mergeClassNames(
            "pointer-events-none fixed bottom-5 left-1/2 z-50 w-[min(calc(100vw-1.5rem),28rem)] -translate-x-1/2 px-2 sm:bottom-6",
            containerClassName,
        )}>
            <div
                role="status"
                aria-live="polite"
                className="rounded-[20px] border border-[#d9d4ff] bg-[rgba(17,24,39,0.94)] px-4 py-3 shadow-[0px_18px_44px_rgba(17,24,39,0.28)] backdrop-blur-sm"
                style={{
                    animation: "chat-toast-enter 200ms ease-out, chat-toast-exit 200ms ease-out 2.2s forwards",
                }}
            >
                <p className={`${friendsBodyFont.className} break-keep text-[12px] leading-[1.55] text-white sm:text-[13px]`}>
                    {toast.message}
                </p>
            </div>
        </div>
    );
}