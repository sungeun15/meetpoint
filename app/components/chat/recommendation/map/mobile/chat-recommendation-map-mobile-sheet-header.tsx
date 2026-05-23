import { friendsDisplayFont, friendsHeadingFont } from "../../../../friends/fonts";

import type { RecommendationMapMobileSheetState } from "./use-recommendation-map-mobile-sheet-controller";

type SheetStateButtonProps = {
    label: string;
    isActive: boolean;
    onClick: () => void;
};

type ChatRecommendationMapMobileSheetHeaderProps = {
    sheetState: RecommendationMapMobileSheetState;
    onSetCollapsed: () => void;
    onSetHalf: () => void;
    onSetExpanded: () => void;
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (event: React.PointerEvent<HTMLDivElement>) => void;
};

function SheetStateButton({ label, isActive, onClick }: SheetStateButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`${friendsDisplayFont.className} inline-flex min-h-8 items-center rounded-full border px-2.5 py-1 text-[10px] transition-colors ${isActive
                ? "border-[#6f5ef9] bg-[#6f5ef9] text-white"
                : "border-[#d9d4ff] bg-white text-[#5f47d2]"}`}
        >
            {label}
        </button>
    );
}

function buildSheetTitle(sheetState: RecommendationMapMobileSheetState) {
    if (sheetState === "expanded") {
        return "추천 목록 전체 보기";
    }

    if (sheetState === "collapsed") {
        return "추천 장소 빠르게 보기";
    }

    return "추천 장소와 길찾기 확인";
}

export function buildSheetTopClassName(sheetState: RecommendationMapMobileSheetState) {
    if (sheetState === "expanded") {
        return "top-[14%]";
    }

    if (sheetState === "collapsed") {
        return "top-[88%]";
    }

    return "top-[64%]";
}

export function ChatRecommendationMapMobileSheetHeader({
    sheetState,
    onSetCollapsed,
    onSetHalf,
    onSetExpanded,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
}: ChatRecommendationMapMobileSheetHeaderProps) {
    return (
        <>
            <div className="mx-auto mb-2 h-1.5 w-11 rounded-full bg-[#d9d4ff] touch-none"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerCancel}
            />

            <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                    <p className={`${friendsHeadingFont.className} text-[13px] text-[#1d114f]`}>
                        {buildSheetTitle(sheetState)}
                    </p>
                </div>

                {sheetState === "collapsed" ? (
                    <div className="flex shrink-0 items-center gap-1.5">
                        <SheetStateButton label="중간" isActive={false} onClick={onSetHalf} />
                    </div>
                ) : (
                    <div className="flex shrink-0 items-center gap-1.5">
                        <SheetStateButton label="작게" isActive={false} onClick={onSetCollapsed} />
                        <SheetStateButton label="중간" isActive={sheetState === "half"} onClick={onSetHalf} />
                        <SheetStateButton label="전체" isActive={sheetState === "expanded"} onClick={onSetExpanded} />
                    </div>
                )}
            </div>
        </>
    );
}