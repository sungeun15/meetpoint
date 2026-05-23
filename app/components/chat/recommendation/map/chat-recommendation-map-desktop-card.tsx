import { friendsDisplayFont, friendsHeadingFont } from "../../../friends/fonts";
import { RecommendationModeBadge } from "../chat-recommendation-shared";
import { ChatSectionCard } from "../../chat-ui";
import { RecommendationMapChipList } from "./chat-recommendation-map-chip-list";
import { ChatRecommendationMapSelectedPlaceCard } from "./chat-recommendation-map-selected-place-card";
import { KakaoMapPreview } from "./kakao-map-preview";
import type { MapMarker, RecommendationSummary } from "../../types";

type RecommendationMapPresenter = {
    sectionLabel: string;
    title: string;
    copy: string;
    shouldRenderRecommendationChipList: boolean;
    shouldRenderParticipantMarkerChips: boolean;
};

type ChatRecommendationMapDesktopCardProps = {
    recommendationSummary: RecommendationSummary;
    presenter: RecommendationMapPresenter;
    participantMarkers: MapMarker[];
    placeMarkers: MapMarker[];
    mapMarkers: MapMarker[];
    activeMarkerId: string | null;
    focusedMarkerId: string | null;
    selectedPlaceMarker: MapMarker | null;
    routeCardProps: React.ComponentProps<typeof ChatRecommendationMapSelectedPlaceCard>;
    onPlaceChipSelect: (markerId: string) => void;
    onMarkerSelect: (markerId: string) => void;
    onOpenFullscreen: () => void;
};

export function ChatRecommendationMapDesktopCard({
    recommendationSummary,
    presenter,
    participantMarkers,
    placeMarkers,
    mapMarkers,
    activeMarkerId,
    focusedMarkerId,
    selectedPlaceMarker,
    routeCardProps,
    onPlaceChipSelect,
    onMarkerSelect,
    onOpenFullscreen,
}: ChatRecommendationMapDesktopCardProps) {
    const participantMarkerChips = participantMarkers.map((marker) => (
        <span
            key={marker.id}
            className="shrink-0 whitespace-nowrap rounded-full bg-[#ede7ff] px-2.5 py-1 text-[10px] text-[#5f47d2] sm:px-3 sm:text-[11px]"
        >
            {marker.label}
        </span>
    ));

    return (
        <ChatSectionCard className="hidden h-full flex-col px-3 py-3.5 sm:px-4 sm:py-5 lg:flex lg:px-5 xl:px-5">
            <div className="space-y-3 sm:space-y-3.5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                        <p className={`${friendsDisplayFont.className} text-[13px] text-[#111827] sm:text-[16px]`}>
                            {presenter.sectionLabel}
                        </p>
                        <div className="mt-1.5">
                            <p className={`${friendsHeadingFont.className} text-[15px] text-[#111827] sm:text-[20px]`}>
                                {presenter.title}
                            </p>
                            <p className={`${friendsDisplayFont.className} mt-1.5 hidden text-[12px] leading-[1.55] text-[#5f6782] sm:block sm:text-[13px]`}>
                                {presenter.copy}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-start">
                        <button
                            type="button"
                            onClick={onOpenFullscreen}
                            className={`${friendsDisplayFont.className} inline-flex min-h-11 items-center gap-2 rounded-full border border-white/70 bg-[linear-gradient(135deg,#6f5ef9_0%,#4f8cff_100%)] px-4 py-2 text-[12px] font-semibold text-white shadow-[0px_14px_28px_rgba(79,140,255,0.28)] transition-[transform,box-shadow,opacity] duration-200 hover:-translate-y-px hover:shadow-[0px_18px_34px_rgba(79,140,255,0.34)] hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8d7ff]`}
                        >
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/18 ring-1 ring-white/28">
                                <svg viewBox="0 0 20 20" aria-hidden="true" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M7 3.5H3.5V7M13 3.5H16.5V7M7 16.5H3.5V13M13 16.5H16.5V13" strokeLinecap="round" />
                                    <path d="M7 3.5L3.5 7M13 3.5L16.5 7M7 16.5L3.5 13M13 16.5L16.5 13" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                            <span>지도 크게 보기</span>
                        </button>
                        <RecommendationModeBadge modeLabel={recommendationSummary.modeLabel} emphasized />
                    </div>
                </div>

                {presenter.shouldRenderRecommendationChipList ? (
                    <RecommendationMapChipList
                        participantMarkers={participantMarkers}
                        placeMarkers={placeMarkers}
                        activeMarkerId={activeMarkerId}
                        onPlaceChipSelect={onPlaceChipSelect}
                    />
                ) : presenter.shouldRenderParticipantMarkerChips ? (
                    <div className="mt-2.5 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">{participantMarkerChips}</div>
                ) : null}

                <ChatRecommendationMapSelectedPlaceCard {...routeCardProps} selectedPlaceMarker={selectedPlaceMarker} />
            </div>

            <div className="mt-2 flex-1 rounded-[20px] border border-[#ddd8ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(241,237,255,0.92)_100%)] px-1.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] sm:mt-2.5 sm:px-3 sm:py-3">
                <KakaoMapPreview
                    markers={mapMarkers}
                    selectedMarkerId={focusedMarkerId}
                    routeSegments={routeCardProps.routeStatus === "ready" ? routeCardProps.routeSegments : []}
                    onMarkerSelect={onMarkerSelect}
                />
            </div>
        </ChatSectionCard>
    );
}