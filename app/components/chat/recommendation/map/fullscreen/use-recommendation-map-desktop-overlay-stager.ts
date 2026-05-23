"use client";

import { useEffect, useRef, useState } from "react";

type UseRecommendationMapDesktopOverlayStagerArgs = {
    openOverlay: () => void;
    closeOverlay: () => void;
};

export function useRecommendationMapDesktopOverlayStager({
    openOverlay,
    closeOverlay,
}: UseRecommendationMapDesktopOverlayStagerArgs) {
    const frameRef = useRef<number | null>(null);
    const [shouldRenderOverlay, setShouldRenderOverlay] = useState(false);

    useEffect(() => {
        return () => {
            if (frameRef.current !== null) {
                window.cancelAnimationFrame(frameRef.current);
            }
        };
    }, []);

    function openStagedOverlay() {
        if (frameRef.current !== null) {
            window.cancelAnimationFrame(frameRef.current);
        }

        setShouldRenderOverlay(false);
        openOverlay();
        frameRef.current = window.requestAnimationFrame(() => {
            setShouldRenderOverlay(true);
            frameRef.current = null;
        });
    }

    function closeStagedOverlay() {
        if (frameRef.current !== null) {
            window.cancelAnimationFrame(frameRef.current);
            frameRef.current = null;
        }

        setShouldRenderOverlay(false);
        closeOverlay();
    }

    return {
        shouldRenderOverlay,
        openStagedOverlay,
        closeStagedOverlay,
    };
}