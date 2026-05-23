"use client";

import { useCallback, useEffect, useState } from "react";

type UseRecommendationMapFullscreenControllerArgs = {
    initialOpen?: boolean;
};

// 전체화면 오버레이의 열림 상태와 기본 body scroll lock, ESC 닫기를 관리합니다.
export function useRecommendationMapFullscreenController({
    initialOpen = false,
}: UseRecommendationMapFullscreenControllerArgs = {}) {
    const [isOpen, setIsOpen] = useState(initialOpen);

    const open = useCallback(() => {
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        }

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen]);

    return {
        isOpen,
        open,
        close,
    };
}