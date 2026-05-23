"use client";

import { createPortal } from "react-dom";

import { friendsDisplayFont, friendsHeadingFont } from "../../../../friends/fonts";
import { RecommendationMapChipList } from "../chat-recommendation-map-chip-list";
import { ChatRecommendationMapSelectedPlaceCard } from "../chat-recommendation-map-selected-place-card";
import { ChatRecommendationMapFullscreenCanvas } from "./chat-recommendation-map-fullscreen-canvas";
import { ChatRecommendationMapFullscreenResultsList } from "./chat-recommendation-map-fullscreen-results-list";
import type { MapMarker, RecommendationSummary } from "../../../types";

type RecommendationMapPresenter = {
    title: string;
    copy: string;
};

type ChatRecommendationMapFullscreenOverlayProps = {
    isOpen: boolean;
    recommendationSummary: RecommendationSummary;
    presenter: RecommendationMapPresenter;
    participantMarkers: MapMarker[];
    placeMarkers: MapMarker[];
    mapMarkers: MapMarker[];
    activeMarkerId: string | null;
    focusedMarkerId: string | null;
    routeCardProps: React.ComponentProps<typeof ChatRecommendationMapSelectedPlaceCard>;
    onClose: () => void;
    onPlaceChipSelect: (markerId: string) => void;
    onMarkerSelect: (markerId: string) => void;
};

export function ChatRecommendationMapFullscreenOverlay({
    isOpen,
    recommendationSummary,
    presenter,
    participantMarkers,
    placeMarkers,
    mapMarkers,
    activeMarkerId,
    focusedMarkerId,
    routeCardProps,
    onClose,
    onPlaceChipSelect,
    onMarkerSelect,
}: ChatRecommendationMapFullscreenOverlayProps) {
    if (typeof document === "undefined" || !isOpen) {
        return null;
    }

    return createPortal(
        <div className="fixed inset-0 z-140 hidden bg-[rgba(17,24,39,0.34)] px-6 py-6 lg:block">
            <div className="flex h-full min-h-0 max-h-full flex-col overflow-hidden rounded-4xl bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(243,240,255,0.98)_100%)] p-5 shadow-[0px_30px_90px_rgba(31,41,55,0.24)] xl:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className={`${friendsDisplayFont.className} text-[13px] text-[#5f6782]`}>
                            {recommendationSummary.modeLabel}
                        </p>
                        <h2 className={`${friendsHeadingFont.className} mt-1 text-[24px] text-[#111827]`}>
                            {presenter.title}
                        </h2>
                        <p className={`${friendsDisplayFont.className} mt-2 text-[13px] leading-[1.6] text-[#5f6782]`}>
                            {presenter.copy}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className={`${friendsDisplayFont.className} inline-flex min-h-11 items-center rounded-full border border-[#d9d4ff] bg-white px-4 py-2 text-[12px] text-[#544b88] transition-colors hover:bg-[#f4f1ff]`}
                    >
                        닫기
                    </button>
                </div>

                <div className="mt-4 grid min-h-0 flex-1 gap-4 overflow-hidden lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,2.2fr)]">
                    <div className="grid min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] gap-4">
                        <div className="min-w-0">
                            <RecommendationMapChipList
                                participantMarkers={participantMarkers}
                                placeMarkers={placeMarkers}
                                activeMarkerId={activeMarkerId}
                                onPlaceChipSelect={onPlaceChipSelect}
                            />
                        </div>

                        <div className="min-h-0 overflow-y-auto">
                            <ChatRecommendationMapFullscreenResultsList
                                placeMarkers={placeMarkers}
                                activeMarkerId={activeMarkerId}
                                selectedPlaceMarker={routeCardProps.selectedPlaceMarker}
                                selectedTransportMode={routeCardProps.selectedTransportMode}
                                routeStatus={routeCardProps.routeStatus}
                                routeSegments={routeCardProps.routeSegments}
                                routeOriginMarkers={routeCardProps.routeOriginMarkers}
                                pendingExternalRouteLinkId={routeCardProps.pendingExternalRouteLinkId}
                                shouldShowExternalRouteLinks={routeCardProps.shouldShowExternalRouteLinks}
                                onTransportModeSelect={routeCardProps.onTransportModeSelect}
                                onExternalRouteOpen={routeCardProps.onExternalRouteOpen}
                                onPlaceSelect={onPlaceChipSelect}
                            />
                        </div>
                    </div>

                    <div className="min-h-0 overflow-hidden rounded-[28px] border border-[#ddd8ff] bg-white/85 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
                        <ChatRecommendationMapFullscreenCanvas
                            markers={mapMarkers}
                            selectedMarkerId={focusedMarkerId}
                            routeSegments={routeCardProps.routeStatus === "ready" ? routeCardProps.routeSegments : []}
                            onMarkerSelect={onMarkerSelect}
                        />
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}