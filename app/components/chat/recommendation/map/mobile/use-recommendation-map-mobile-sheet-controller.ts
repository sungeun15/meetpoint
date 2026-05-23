"use client";

import { useCallback, useRef, useState } from "react";

export type RecommendationMapMobileSheetState = "collapsed" | "half" | "expanded";

const SHEET_SWIPE_THRESHOLD = 36;

// 모바일 전체화면 지도 위의 하단 시트를 collapsed/half/expanded 상태로 제어합니다.
export function useRecommendationMapMobileSheetController() {
    const dragStartYRef = useRef<number | null>(null);
    const [sheetState, setSheetState] = useState<RecommendationMapMobileSheetState>("half");

    const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        dragStartYRef.current = event.clientY;
        event.currentTarget.setPointerCapture(event.pointerId);
    }, []);

    const handlePointerMove = useCallback(() => {
    }, []);

    const handlePointerEnd = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        if (dragStartYRef.current === null) {
            return;
        }

        const dragDelta = event.clientY - dragStartYRef.current;

        if (dragDelta <= -SHEET_SWIPE_THRESHOLD) {
            setSheetState((currentState) => {
                if (currentState === "collapsed") {
                    return "half";
                }

                return "expanded";
            });
        }

        if (dragDelta >= SHEET_SWIPE_THRESHOLD) {
            setSheetState((currentState) => {
                if (currentState === "expanded") {
                    return "half";
                }

                return "collapsed";
            });
        }

        dragStartYRef.current = null;
    }, []);

    return {
        sheetState,
        setCollapsed: () => setSheetState("collapsed"),
        setHalf: () => setSheetState("half"),
        setExpanded: () => setSheetState("expanded"),
        ensureHalf: () => setSheetState((currentState) => (currentState === "collapsed" ? "half" : currentState)),
        handlePointerDown,
        handlePointerMove,
        handlePointerUp: handlePointerEnd,
        handlePointerCancel: handlePointerEnd,
    };
}