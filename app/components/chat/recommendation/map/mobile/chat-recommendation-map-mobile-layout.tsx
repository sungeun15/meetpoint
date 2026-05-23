"use client";

import { createPortal } from "react-dom";

import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../../../../friends/fonts";
import { RecommendationModeBadge } from "../../chat-recommendation-shared";
import { ChatRecommendationMapSelectedPlaceCard } from "../chat-recommendation-map-selected-place-card";
import { KakaoMapPreview } from "../kakao-map-preview";
import { ChatRecommendationMapMobileSheetContent } from "./chat-recommendation-map-mobile-sheet-content";
import {
    buildSheetTopClassName,
    ChatRecommendationMapMobileSheetHeader,
} from "./chat-recommendation-map-mobile-sheet-header";
import {
    useRecommendationMapMobileSheetController,
} from "./use-recommendation-map-mobile-sheet-controller";
import type { MapMarker, RecommendationSummary } from "../../../types";

type RecommendationMapPresenter = {
    title: string;
    copy: string;
};

type ChatRecommendationMapMobileLayoutProps = {
    isOpen: boolean;
    recommendationSummary: RecommendationSummary;
    presenter: RecommendationMapPresenter;
    participantMarkers: MapMarker[];
    placeMarkers: MapMarker[];
    mapMarkers: MapMarker[];
    activeMarkerId: string | null;
    focusedMarkerId: string | null;
    selectedPlaceMarker: MapMarker | null;
    routeCardProps: React.ComponentProps<typeof ChatRecommendationMapSelectedPlaceCard>;
    onClose: () => void;
    onPlaceChipSelect: (markerId: string) => void;
    onMarkerSelect: (markerId: string) => void;
};

export function ChatRecommendationMapMobileLayout({
    isOpen,
    recommendationSummary,
    presenter,
    participantMarkers,
    placeMarkers,
    mapMarkers,
    activeMarkerId,
    focusedMarkerId,
    selectedPlaceMarker,
    routeCardProps,
    onClose,
    onPlaceChipSelect,
    onMarkerSelect,
}: ChatRecommendationMapMobileLayoutProps) {
    const {
        sheetState,
        setCollapsed,
        setHalf,
        setExpanded,
        ensureHalf,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        handlePointerCancel,
    } = useRecommendationMapMobileSheetController();

    if (typeof document === "undefined" || !isOpen) {
        return null;
    }

    const mobileRouteCardProps = {
        ...routeCardProps,
        onTransportModeSelect: (nextMode: Parameters<typeof routeCardProps.onTransportModeSelect>[0]) => {
            ensureHalf();
            routeCardProps.onTransportModeSelect(nextMode);
        },
        onExternalRouteOpen: async (marker: Parameters<typeof routeCardProps.onExternalRouteOpen>[0]) => {
            ensureHalf();
            await routeCardProps.onExternalRouteOpen(marker);
        },
    } satisfies React.ComponentProps<typeof ChatRecommendationMapSelectedPlaceCard>;

    function handleMobilePlaceSelect(markerId: string) {
        ensureHalf();
        onPlaceChipSelect(markerId);
    }

    function handleMobileMarkerSelect(markerId: string) {
        ensureHalf();
        onMarkerSelect(markerId);
    }

    return createPortal(
        <div className="fixed inset-0 z-150 bg-[#eef2ff] lg:hidden">
            <div className="flex h-full flex-col bg-[radial-gradient(circle_at_top,rgba(215,223,255,0.95),rgba(238,242,255,0.98)_36%,rgba(248,250,252,0.98)_100%)]">
                <div className="px-4 pb-3 pt-[calc(env(safe-area-inset-top)+12px)]">
                    <div className="flex items-start justify-between gap-3 rounded-3xl bg-white/86 px-4 py-3 shadow-[0px_18px_40px_rgba(67,56,202,0.14)] backdrop-blur">
                        <div className="min-w-0">
                            <p className={`${friendsDisplayFont.className} text-[12px] text-[#5f6782]`}>
                                {recommendationSummary.modeLabel}
                            </p>
                            <p className={`${friendsHeadingFont.className} mt-1 text-[18px] text-[#111827]`}>
                                {presenter.title}
                            </p>
                            <p className={`${friendsBodyFont.className} mt-1 text-[12px] leading-normal text-[#5f6782]`}>
                                {presenter.copy}
                            </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <RecommendationModeBadge modeLabel={recommendationSummary.modeLabel} emphasized />
                            <button
                                type="button"
                                onClick={onClose}
                                className={`${friendsDisplayFont.className} inline-flex min-h-10 items-center rounded-full border border-[#d9d4ff] bg-white px-3 py-1.5 text-[11px] text-[#544b88]`}
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>

                <div className="min-h-0 flex-1 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)]">
                    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[30px] border border-white/70 bg-white/60 shadow-[0px_24px_50px_rgba(67,56,202,0.18)] backdrop-blur">
                        <div className="absolute inset-0 z-0 p-2">
                            <KakaoMapPreview
                                markers={mapMarkers}
                                selectedMarkerId={focusedMarkerId}
                                routeSegments={routeCardProps.routeStatus === "ready" ? routeCardProps.routeSegments : []}
                                onMarkerSelect={handleMobileMarkerSelect}
                            />
                        </div>

                        <div
                            className={`absolute inset-x-0 bottom-0 z-20 min-h-0 rounded-t-[30px] border-t border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(246,243,255,0.98)_100%)] px-4 pb-[calc(env(safe-area-inset-bottom)+14px)] pt-3 shadow-[0px_-14px_30px_rgba(67,56,202,0.12)] transition-[top] duration-200 ease-out ${buildSheetTopClassName(sheetState)}`}
                        >
                            <ChatRecommendationMapMobileSheetHeader
                                sheetState={sheetState}
                                onSetCollapsed={setCollapsed}
                                onSetHalf={setHalf}
                                onSetExpanded={setExpanded}
                                onPointerDown={handlePointerDown}
                                onPointerMove={handlePointerMove}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerCancel}
                            />

                            <div className="max-h-full min-h-0 overflow-y-auto overscroll-contain pr-1 pb-2">
                                <ChatRecommendationMapMobileSheetContent
                                    sheetState={sheetState}
                                    participantMarkers={participantMarkers}
                                    placeMarkers={placeMarkers}
                                    activeMarkerId={activeMarkerId}
                                    selectedPlaceMarker={selectedPlaceMarker}
                                    routeCardProps={mobileRouteCardProps}
                                    onPlaceChipSelect={handleMobilePlaceSelect}
                                    onSetHalf={setHalf}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}