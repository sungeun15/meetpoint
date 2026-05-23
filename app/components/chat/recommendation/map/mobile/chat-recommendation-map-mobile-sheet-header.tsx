import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../../../../friends/fonts";

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

function buildSheetDescription(sheetState: RecommendationMapMobileSheetState) {
    if (sheetState === "collapsed") {
        return "지도를 더 넓게 보다가 필요할 때 바로 중간 상태로 올릴 수 있습니다.";
    }

    return "핸들을 드래그하거나 보기 버튼으로 시트 높이를 조절할 수 있습니다.";
}

export function buildSheetTopClassName(sheetState: RecommendationMapMobileSheetState) {
    if (sheetState === "expanded") {
        return "top-[14%]";
    }

    if (sheetState === "collapsed") {
        return "top-[82%]";
    }

    return "top-[48%]";
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
            <div
                className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[#d9d4ff] touch-none"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerCancel}
            />

            <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                    <p className={`${friendsHeadingFont.className} text-[14px] text-[#1d114f]`}>
                        {buildSheetTitle(sheetState)}
                    </p>
                    <p className={`${friendsBodyFont.className} mt-1 text-[11px] text-[#6a6690]`}>
                        {buildSheetDescription(sheetState)}
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