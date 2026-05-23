"use client";

import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT_QUERY = "(max-width: 1023px)";

// 지도 패널이 모바일 전체화면 레이아웃을 써야 하는지 뷰포트 기준으로 판별합니다.
export function useRecommendationMapViewport() {
    const [isMobileViewport, setIsMobileViewport] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT_QUERY);

        function syncViewportMode() {
            setIsMobileViewport(mediaQuery.matches);
        }

        syncViewportMode();
        mediaQuery.addEventListener("change", syncViewportMode);

        return () => {
            mediaQuery.removeEventListener("change", syncViewportMode);
        };
    }, []);

    return {
        isMobileViewport,
    };
}