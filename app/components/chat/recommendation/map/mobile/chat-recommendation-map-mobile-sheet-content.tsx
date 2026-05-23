import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../../../../friends/fonts";

import { RecommendationMapChipList } from "../chat-recommendation-map-chip-list";
import { ChatRecommendationMapSelectedPlaceCard } from "../chat-recommendation-map-selected-place-card";
import type { MapMarker } from "../../../types";
import type { RecommendationMapMobileSheetState } from "./use-recommendation-map-mobile-sheet-controller";

type ChatRecommendationMapMobileSheetContentProps = {
    sheetState: RecommendationMapMobileSheetState;
    participantMarkers: MapMarker[];
    placeMarkers: MapMarker[];
    activeMarkerId: string | null;
    selectedPlaceMarker: MapMarker | null;
    routeCardProps: React.ComponentProps<typeof ChatRecommendationMapSelectedPlaceCard>;
    onPlaceChipSelect: (markerId: string) => void;
    onSetHalf: () => void;
};

function buildTransportModeLabel(mode: React.ComponentProps<typeof ChatRecommendationMapSelectedPlaceCard>["selectedTransportMode"]) {
    if (mode === "bus") {
        return "버스";
    }

    if (mode === "bike") {
        return "자전거";
    }

    if (mode === "walk") {
        return "도보";
    }

    return "자동차";
}

function ChatRecommendationMapMobileCollapsedSummary({
    placeMarkers,
    selectedPlaceMarker,
    routeCardProps,
    onSetHalf,
}: Pick<ChatRecommendationMapMobileSheetContentProps, "placeMarkers" | "selectedPlaceMarker" | "routeCardProps" | "onSetHalf">) {
    return (
        <div className="space-y-3 rounded-[22px] border border-[#ddd8ff] bg-white/88 px-3.5 py-3.5 shadow-[0px_12px_24px_rgba(67,56,202,0.08)]">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className={`${friendsHeadingFont.className} text-[13px] text-[#1d114f]`}>
                        {selectedPlaceMarker?.label ?? "선택한 추천 장소를 빠르게 확인해요"}
                    </p>
                    <p className={`${friendsBodyFont.className} mt-1 text-[11px] leading-[1.55] text-[#6a6690]`}>
                        추천 장소 {placeMarkers.length}개 준비 · 현재 이동 수단 {buildTransportModeLabel(routeCardProps.selectedTransportMode)}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onSetHalf}
                    className={`${friendsDisplayFont.className} inline-flex min-h-9 shrink-0 items-center rounded-full border border-[#d9d4ff] bg-[#f5f1ff] px-3 py-1.5 text-[11px] text-[#5f47d2]`}
                >
                    중간으로 보기
                </button>
            </div>

            {selectedPlaceMarker?.address ? (
                <p className={`${friendsBodyFont.className} text-[11px] leading-[1.55] text-[#5f6782]`}>
                    {selectedPlaceMarker.address}
                </p>
            ) : (
                <p className={`${friendsBodyFont.className} text-[11px] leading-[1.55] text-[#5f6782]`}>
                    장소를 고르면 길찾기 준비와 외부 카카오맵 액션을 바로 이어서 볼 수 있습니다.
                </p>
            )}
        </div>
    );
}

function ChatRecommendationMapMobileExpandedSummary({
    participantMarkers,
    placeMarkers,
    selectedPlaceMarker,
}: Pick<ChatRecommendationMapMobileSheetContentProps, "participantMarkers" | "placeMarkers" | "selectedPlaceMarker">) {
    return (
        <div className="rounded-[22px] border border-[#ddd8ff] bg-[linear-gradient(180deg,rgba(248,246,255,0.98)_0%,rgba(241,237,255,0.9)_100%)] px-3.5 py-3.5">
            <div className="flex flex-wrap gap-2">
                <span className={`${friendsDisplayFont.className} rounded-full bg-white px-2.5 py-1 text-[10px] text-[#5f47d2]`}>
                    참여자 마커 {participantMarkers.length}개
                </span>
                <span className={`${friendsDisplayFont.className} rounded-full bg-white px-2.5 py-1 text-[10px] text-[#5f47d2]`}>
                    추천 장소 {placeMarkers.length}개
                </span>
                {selectedPlaceMarker ? (
                    <span className={`${friendsDisplayFont.className} rounded-full bg-white px-2.5 py-1 text-[10px] text-[#5f47d2]`}>
                        현재 선택 {selectedPlaceMarker.label}
                    </span>
                ) : null}
            </div>
            <p className={`${friendsBodyFont.className} mt-2 text-[11px] leading-[1.55] text-[#6a6690]`}>
                확장 상태에서는 추천 장소를 길게 비교하고, 선택 장소의 길찾기 액션까지 한 번에 확인합니다.
            </p>
        </div>
    );
}

export function ChatRecommendationMapMobileSheetContent({
    sheetState,
    participantMarkers,
    placeMarkers,
    activeMarkerId,
    selectedPlaceMarker,
    routeCardProps,
    onPlaceChipSelect,
    onSetHalf,
}: ChatRecommendationMapMobileSheetContentProps) {
    if (sheetState === "collapsed") {
        return (
            <ChatRecommendationMapMobileCollapsedSummary
                placeMarkers={placeMarkers}
                selectedPlaceMarker={selectedPlaceMarker}
                routeCardProps={routeCardProps}
                onSetHalf={onSetHalf}
            />
        );
    }

    return (
        <div className="space-y-3">
            {sheetState === "expanded" ? (
                <ChatRecommendationMapMobileExpandedSummary
                    participantMarkers={participantMarkers}
                    placeMarkers={placeMarkers}
                    selectedPlaceMarker={selectedPlaceMarker}
                />
            ) : null}

            <RecommendationMapChipList
                participantMarkers={participantMarkers}
                placeMarkers={placeMarkers}
                activeMarkerId={activeMarkerId}
                onPlaceChipSelect={onPlaceChipSelect}
            />

            <ChatRecommendationMapSelectedPlaceCard {...routeCardProps} selectedPlaceMarker={selectedPlaceMarker} />
        </div>
    );
}