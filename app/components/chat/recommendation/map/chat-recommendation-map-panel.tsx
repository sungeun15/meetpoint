"use client";
import { useEffect, useRef } from "react";
import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../../../friends/fonts";
import { buildRecommendationMapPanelPresenter } from "./chat-recommendation-map-panel-presenter";
import { ChatRecommendationMapDesktopCard } from "./chat-recommendation-map-desktop-card";
import { ChatRecommendationMapSelectedPlaceCard } from "./chat-recommendation-map-selected-place-card";
import { useExternalKakaoRouteLinkController } from "./use-external-kakao-route-link-controller";
import { useRecommendationMapDesktopOverlayStager } from "./fullscreen/use-recommendation-map-desktop-overlay-stager";
import { ChatRecommendationMapFullscreenOverlay } from "./fullscreen/chat-recommendation-map-fullscreen-overlay";
import { useRecommendationMapFullscreenController } from "./fullscreen/use-recommendation-map-fullscreen-controller";
import { ChatRecommendationMapMobileLayout } from "./mobile/chat-recommendation-map-mobile-layout";
import { useRecommendationMapViewport } from "./use-recommendation-map-viewport";
import { ChatSectionCard } from "../../chat-ui";
import type {
    MapMarker,
    RecommendationRouteSegment,
    RecommendationRouteStatus,
    RecommendationSummary,
    RecommendationTransportMode,
} from "../../types";

export type ChatRecommendationMapPanelProps = {
    recommendationSummary: RecommendationSummary; // 현재 추천 모드와 요약 라벨 묶음입니다.
    hasRecommendations: boolean; // 실제 추천 결과가 준비된 상태인지 나타냅니다.
    mapMarkers: MapMarker[]; // 지도와 칩 목록에 함께 반영할 전체 마커 배열입니다.
    activeMarkerId: string | null; // 칩 목록에서 현재 활성화된 장소 마커 id입니다.
    focusedMarkerId: string | null; // 지도에서 강조 표시할 마커 id입니다.
    selectedPlaceId: string | null; // 길찾기 UI를 노출할 명시적 장소 선택 id입니다.
    selectedTransportMode: RecommendationTransportMode; // 현재 선택된 길찾기 이동 수단입니다.
    routeStatus: RecommendationRouteStatus; // 길찾기 경로 조회 상태입니다.
    routeErrorMessage: string | null; // 길찾기 조회 실패 시 보여줄 오류 문구입니다.
    routeSegments: RecommendationRouteSegment[]; // 지도와 상단 요약에 반영할 경로 세그먼트 목록입니다.
    onMarkerSelect: (markerId: string) => void; // 지도 마커 클릭 시 선택 상태를 갱신합니다.
    onPlaceChipSelect: (markerId: string) => void; // 장소 칩 클릭 시 해당 마커를 활성화합니다.
    onTransportModeSelect: (nextMode: RecommendationTransportMode) => void; // 상단 이동 수단 버튼 선택을 갱신합니다.
};

// 추천 지도 패널은 모바일 전체화면과 데스크톱 카드를 같은 상태로 조합합니다.
export function ChatRecommendationMapPanel({
    recommendationSummary,
    hasRecommendations,
    mapMarkers,
    activeMarkerId,
    focusedMarkerId,
    selectedPlaceId,
    selectedTransportMode,
    routeStatus,
    routeErrorMessage,
    routeSegments,
    onMarkerSelect,
    onPlaceChipSelect,
    onTransportModeSelect,
}: ChatRecommendationMapPanelProps) {
    const { isMobileViewport } = useRecommendationMapViewport();
    const {
        isOpen: isMobileOverlayOpen,
        open: openMobileOverlay,
        close: closeMobileOverlay,
    } = useRecommendationMapFullscreenController();
    const {
        isOpen: isDesktopOverlayOpen,
        open: openDesktopOverlay,
        close: closeDesktopOverlay,
    } = useRecommendationMapFullscreenController();
    const hasAutoOpenedMobileRef = useRef(false);
    const {
        shouldRenderOverlay: shouldRenderDesktopOverlay,
        openStagedOverlay: openStagedDesktopOverlay,
        closeStagedOverlay: closeStagedDesktopOverlay,
    } = useRecommendationMapDesktopOverlayStager({
        openOverlay: openDesktopOverlay,
        closeOverlay: closeDesktopOverlay,
    });
    const participantMarkers = mapMarkers.filter((marker) => marker.markerType !== "place");
    const routeOriginMarkers = mapMarkers.filter(
        (marker) => marker.markerType === "person" && (marker.id === "me" || marker.id === "friend"),
    );
    const placeMarkers = mapMarkers.filter((marker) => marker.markerType === "place");
    const selectedPlaceMarker = selectedPlaceId
        ? placeMarkers.find((marker) => marker.id === selectedPlaceId) ?? null
        : null;
    const presenter = buildRecommendationMapPanelPresenter({
        hasRecommendations,
        participantMarkerCount: participantMarkers.length,
    });
    const {
        pendingExternalRouteLinkId,
        shouldShowExternalRouteLinks,
        openExternalRouteLink,
    } = useExternalKakaoRouteLinkController({
        routeOriginMarkers,
        selectedPlaceMarker,
        selectedTransportMode,
    });

    useEffect(() => {
        if (!isMobileViewport) {
            closeMobileOverlay();
            return;
        }
        if (!hasRecommendations || hasAutoOpenedMobileRef.current) {
            return;
        }
        hasAutoOpenedMobileRef.current = true;
        openMobileOverlay();
    }, [closeMobileOverlay, hasRecommendations, isMobileViewport, openMobileOverlay]);

    const routeCardProps = {
        selectedPlaceMarker,
        selectedTransportMode,
        routeStatus,
        routeErrorMessage,
        routeSegments,
        routeOriginMarkers,
        pendingExternalRouteLinkId,
        shouldShowExternalRouteLinks,
        onTransportModeSelect,
        onExternalRouteOpen: openExternalRouteLink,
    } satisfies React.ComponentProps<typeof ChatRecommendationMapSelectedPlaceCard>;

    return (
        <>
            {isMobileViewport ? (
                <>
                    <ChatSectionCard className="flex min-h-42 flex-col px-3 py-3.5 lg:hidden">
                        <p className={`${friendsDisplayFont.className} text-[12px] text-[#5f6782]`}>
                            {presenter.sectionLabel}
                        </p>
                        <p className={`${friendsHeadingFont.className} mt-1 text-[16px] text-[#111827]`}>
                            모바일 지도 전체화면
                        </p>
                        <p className={`${friendsBodyFont.className} mt-2 text-[12px] leading-[1.6] text-[#5f6782]`}>
                            모바일에서는 지도를 전체화면으로 열어 추천 장소와 길찾기 상태를 함께 탐색합니다.
                        </p>
                        <button
                            type="button"
                            onClick={openMobileOverlay}
                            className={`${friendsDisplayFont.className} mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-full border border-[#6f5ef9] bg-[#6f5ef9] px-3 py-2 text-[12px] text-white shadow-[0px_12px_22px_rgba(111,94,249,0.22)]`}
                        >
                            지도 열기
                        </button>
                    </ChatSectionCard>
                    {isMobileOverlayOpen ? (
                        <ChatRecommendationMapMobileLayout
                            isOpen={isMobileOverlayOpen}
                            recommendationSummary={recommendationSummary}
                            presenter={presenter}
                            participantMarkers={participantMarkers}
                            placeMarkers={placeMarkers}
                            mapMarkers={mapMarkers}
                            activeMarkerId={activeMarkerId}
                            focusedMarkerId={focusedMarkerId}
                            selectedPlaceMarker={selectedPlaceMarker}
                            routeCardProps={routeCardProps}
                            onClose={closeMobileOverlay}
                            onPlaceChipSelect={onPlaceChipSelect}
                            onMarkerSelect={onMarkerSelect}
                        />
                    ) : null}
                </>
            ) : null}
            {!isMobileViewport ? (
                <>
                    {!isDesktopOverlayOpen ? (
                        <ChatRecommendationMapDesktopCard
                            recommendationSummary={recommendationSummary}
                            presenter={presenter}
                            participantMarkers={participantMarkers}
                            placeMarkers={placeMarkers}
                            mapMarkers={mapMarkers}
                            activeMarkerId={activeMarkerId}
                            focusedMarkerId={focusedMarkerId}
                            selectedPlaceMarker={selectedPlaceMarker}
                            routeCardProps={routeCardProps}
                            onPlaceChipSelect={onPlaceChipSelect}
                            onMarkerSelect={onMarkerSelect}
                            onOpenFullscreen={openStagedDesktopOverlay}
                        />
                    ) : null}
                    {isDesktopOverlayOpen && shouldRenderDesktopOverlay ? (
                        <ChatRecommendationMapFullscreenOverlay
                            isOpen={isDesktopOverlayOpen}
                            recommendationSummary={recommendationSummary}
                            presenter={presenter}
                            participantMarkers={participantMarkers}
                            placeMarkers={placeMarkers}
                            mapMarkers={mapMarkers}
                            activeMarkerId={activeMarkerId}
                            focusedMarkerId={focusedMarkerId}
                            routeCardProps={routeCardProps}
                            onClose={closeStagedDesktopOverlay}
                            onPlaceChipSelect={onPlaceChipSelect}
                            onMarkerSelect={onMarkerSelect}
                        />
                    ) : null}
                </>
            ) : null}
        </>
    );
}