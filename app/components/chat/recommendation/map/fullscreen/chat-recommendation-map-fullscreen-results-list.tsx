import { useEffect, useRef } from "react";

import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../../../../friends/fonts";
import { resolvePlaceMarkerPalette } from "../place-marker-palette";
import {
    buildRouteStatusLabel,
    TRANSPORT_MODE_OPTIONS,
} from "./chat-recommendation-map-fullscreen-results-list-presenter";

import type {
    MapMarker,
    RecommendationRouteSegment,
    RecommendationRouteStatus,
    RecommendationTransportMode,
} from "../../../types";

type ChatRecommendationMapFullscreenResultsListProps = {
    placeMarkers: MapMarker[];
    activeMarkerId: string | null;
    selectedPlaceMarker: MapMarker | null;
    selectedTransportMode: RecommendationTransportMode;
    routeStatus: RecommendationRouteStatus;
    routeSegments: RecommendationRouteSegment[];
    routeOriginMarkers: MapMarker[];
    pendingExternalRouteLinkId: string | null;
    shouldShowExternalRouteLinks: boolean;
    onTransportModeSelect: (nextMode: RecommendationTransportMode) => void;
    onExternalRouteOpen: (marker: MapMarker) => Promise<void>;
    onPlaceSelect: (markerId: string) => void;
};

export function ChatRecommendationMapFullscreenResultsList({
    placeMarkers,
    activeMarkerId,
    selectedPlaceMarker,
    selectedTransportMode,
    routeStatus,
    routeSegments,
    routeOriginMarkers,
    pendingExternalRouteLinkId,
    shouldShowExternalRouteLinks,
    onTransportModeSelect,
    onExternalRouteOpen,
    onPlaceSelect,
}: ChatRecommendationMapFullscreenResultsListProps) {
    const recommendationItemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    useEffect(() => {
        if (!activeMarkerId) {
            return;
        }

        recommendationItemRefs.current[activeMarkerId]?.scrollIntoView({
            block: "nearest",
            behavior: "smooth",
        });
    }, [activeMarkerId]);

    return (
        <div className="flex h-full min-h-0 flex-col rounded-3xl border border-[#ddd8ff] bg-[linear-gradient(180deg,rgba(248,246,255,0.98)_0%,rgba(241,237,255,0.92)_100%)] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            <div className="shrink-0">
                <p className={`${friendsDisplayFont.className} text-[10px] uppercase tracking-[0.16em] text-[#7c6ae6]`}>
                    Recommendation Results
                </p>
                <p className={`${friendsHeadingFont.className} mt-1 text-[16px] text-[#1d114f]`}>
                    추천 결과 목록
                </p>
            </div>

            <div className="mt-3 shrink-0 rounded-[22px] border border-white/80 bg-white/72 p-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className={`${friendsHeadingFont.className} text-[14px] text-[#1d114f]`}>
                            {selectedPlaceMarker?.label ?? "선택한 장소 길찾기"}
                        </p>
                        <p className={`${friendsBodyFont.className} mt-1 text-[11px] leading-[1.55] text-[#6a6690]`}>
                            {buildRouteStatusLabel(routeStatus, routeSegments)}
                        </p>
                    </div>
                    <span className={`${friendsDisplayFont.className} shrink-0 rounded-full bg-[#f3eeff] px-2.5 py-1 text-[10px] text-[#5f47d2]`}>
                        {TRANSPORT_MODE_OPTIONS.find((option) => option.mode === selectedTransportMode)?.label}
                    </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                    {TRANSPORT_MODE_OPTIONS.map((option) => {
                        const isActive = option.mode === selectedTransportMode;

                        return (
                            <button
                                key={option.mode}
                                type="button"
                                onClick={() => onTransportModeSelect(option.mode)}
                                className={`${friendsDisplayFont.className} rounded-full border px-2.5 py-1.5 text-[11px] transition-colors ${isActive
                                    ? "border-[#6f5ef9] bg-[#6f5ef9] text-white shadow-[0px_8px_18px_rgba(111,94,249,0.18)]"
                                    : "border-[#d9d4ff] bg-white text-[#544b88] hover:bg-[#f4f1ff]"}`}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>

                {shouldShowExternalRouteLinks ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {routeOriginMarkers.map((marker) => (
                            <button
                                key={`fullscreen-route-link:${marker.id}`}
                                type="button"
                                onClick={() => {
                                    void onExternalRouteOpen(marker);
                                }}
                                disabled={pendingExternalRouteLinkId !== null}
                                className={`${friendsDisplayFont.className} rounded-full border border-[#d9d4ff] bg-white px-2.5 py-1.5 text-[10px] text-[#544b88] transition-colors hover:bg-[#f4f1ff] disabled:cursor-wait disabled:opacity-70`}
                            >
                                {pendingExternalRouteLinkId === marker.id
                                    ? "주소 확인 중..."
                                    : `${marker.id === "me" ? "내 위치" : "친구 위치"} 카카오맵`}
                            </button>
                        ))}
                    </div>
                ) : null}
            </div>

            {placeMarkers.length === 0 ? (
                <div className="mt-3 flex min-h-0 flex-1 items-center justify-center rounded-2xl border border-dashed border-[#d9d4ff] bg-white/70 px-4 text-center">
                    <p className={`${friendsBodyFont.className} text-[12px] leading-[1.6] text-[#6a6690]`}>
                        아직 추천 결과가 없어요. 추천을 실행하면 이 영역에 장소 목록이 차례대로 표시됩니다.
                    </p>
                </div>
            ) : (
                <div className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 snap-y snap-mandatory">
                    <div className="grid grid-cols-1 auto-rows-[152px] gap-3 xl:auto-rows-[164px]">
                        {placeMarkers.map((marker, index) => {
                            const isActive = activeMarkerId === marker.id;
                            const palette = resolvePlaceMarkerPalette(marker);

                            return (
                                <button
                                    key={marker.id}
                                    ref={(element) => {
                                        recommendationItemRefs.current[marker.id] = element;
                                    }}
                                    type="button"
                                    onClick={() => onPlaceSelect(marker.id)}
                                    className={`flex h-full min-h-0 snap-start flex-col gap-2.5 rounded-[22px] border px-3 py-2.5 text-left transition-colors ${isActive
                                        ? `${palette.cardBorderClassName} ${palette.cardBackgroundClassName} text-[#140f3f] shadow-[0px_18px_34px_rgba(76,29,149,0.16)]`
                                        : "border-white/75 bg-white/84 text-[#2f2a53] hover:border-[#d9d4ff] hover:bg-white"}`}
                                >
                                    <div>
                                        <p className={`${friendsDisplayFont.className} text-[10px] uppercase tracking-[0.14em] ${palette.cardCategoryClassName}`}>
                                            Result {index + 1}
                                        </p>
                                        <p className={`${friendsHeadingFont.className} mt-1.5 text-[16px] leading-[1.35] text-inherit`}>
                                            {marker.label}
                                        </p>
                                        {marker.placeCategory ? (
                                            <p className={`${friendsBodyFont.className} mt-1 text-[11px] ${palette.cardCategoryClassName}`}>
                                                {marker.placeCategory}
                                            </p>
                                        ) : null}
                                        <p className={`${friendsBodyFont.className} mt-1.5 line-clamp-2 text-[11px] leading-normal text-[#5f6782]`}>
                                            {marker.address ?? marker.description}
                                        </p>
                                    </div>

                                    <div className="mt-1.5 flex items-center justify-between gap-2">
                                        <span className={`${friendsDisplayFont.className} rounded-full px-2 py-0.5 text-[9px] ${palette.cardBadgeClassName}`}>
                                            {isActive ? "선택됨" : "지도 동기화"}
                                        </span>
                                        <span className={`${friendsBodyFont.className} text-[10px] text-[#6a6690]`}>
                                            {index + 1}/{placeMarkers.length}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}