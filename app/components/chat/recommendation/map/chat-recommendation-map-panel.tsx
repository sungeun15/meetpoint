import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../../../friends/fonts";
import { RecommendationMapChipList } from "./chat-recommendation-map-chip-list";
import { buildRecommendationMapPanelPresenter } from "./chat-recommendation-map-panel-presenter";
import { KakaoMapPreview } from "./kakao-map-preview";
import { useExternalKakaoRouteLinkController } from "./use-external-kakao-route-link-controller";
import { RecommendationModeBadge } from "../chat-recommendation-shared";
import { ChatSectionCard } from "../../chat-ui";
import type {
    MapMarker,
    RecommendationRouteSegment,
    RecommendationRouteStatus,
    RecommendationSummary,
    RecommendationTransportMode,
} from "../../types";

type TransportModeOption = {
    mode: RecommendationTransportMode;
    label: string;
};

const TRANSPORT_MODE_OPTIONS: TransportModeOption[] = [
    { mode: "bus", label: "버스" },
    { mode: "car", label: "자동차" },
    { mode: "bike", label: "자전거" },
    { mode: "walk", label: "도보" },
];

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

type TransportModeButtonIconProps = {
    mode: RecommendationTransportMode;
};

function TransportModeButtonIcon({ mode }: TransportModeButtonIconProps) {
    if (mode === "bus") {
        return (
            <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
                <rect x="4" y="3.5" width="12" height="10" rx="2.2" />
                <path d="M7 13.5V16M13 13.5V16M6.2 16H7.8M12.2 16H13.8M6.5 7.5H13.5" strokeLinecap="round" />
            </svg>
        );
    }

    if (mode === "bike") {
        return (
            <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="5.5" cy="14" r="2.5" />
                <circle cx="14.5" cy="14" r="2.5" />
                <path d="M7 6.5H10L12 10M9.5 14L12 10L14.5 14M10 6.5L8 10H5.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    }

    if (mode === "walk") {
        return (
            <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="10" cy="4.2" r="1.7" />
                <path d="M10 6.2L8.6 9.3M10 6.2L11.8 8.1M8.6 9.3L7 12.3M8.6 9.3L11.1 10.6M11.1 10.6L12.5 14.7M11.1 10.6L14 9.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M4 11.5H16M6.3 11.5L7.8 8.2H12.3L15.4 11.5M7.4 14.2A1.4 1.4 0 1 1 7.4 17A1.4 1.4 0 0 1 7.4 14.2ZM12.6 14.2A1.4 1.4 0 1 1 12.6 17A1.4 1.4 0 0 1 12.6 14.2Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}


function buildRouteStatusCopy(
    selectedTransportMode: RecommendationTransportMode,
    routeStatus: RecommendationRouteStatus,
    routeSegments: RecommendationRouteSegment[],
) {
    if (selectedTransportMode !== "car") {
        return "현재 선택한 이동 수단은 카카오맵 새창에서 확인할 수 있습니다.";
    }

    if (routeStatus === "loading") {
        return "선택한 이동 수단 기준 경로를 불러오는 중입니다.";
    }

    if (routeStatus === "error") {
        return "경로를 불러오지 못했습니다.";
    }

    if (routeStatus === "ready" && routeSegments.length > 0) {
        return "내 위치와 친구 위치에서 출발하는 경로를 함께 표시합니다.";
    }

    if (routeStatus === "ready") {
        return "표시할 경로가 아직 없습니다.";
    }

    return "이동 수단을 고르면 경로를 준비합니다.";
}

function buildRouteSegmentLabel(segment: RecommendationRouteSegment) {
    return segment.owner === "me" ? "내 위치" : "친구 위치";
}

// 추천 지도 패널의 헤더, 장소 칩 목록, 지도 프리뷰를 한 번에 구성합니다.
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
    // 사람 마커와 장소 마커를 분리해 헤더/칩 영역에 각각 맞게 사용합니다.
    const participantMarkers = mapMarkers.filter((marker) => marker.markerType !== "place");
    const routeOriginMarkers = mapMarkers.filter(
        (marker) => marker.markerType === "person" && (marker.id === "me" || marker.id === "friend"),
    );
    const placeMarkers = mapMarkers.filter((marker) => marker.markerType === "place");
    const selectedPlaceMarker = selectedPlaceId
        ? placeMarkers.find((marker) => marker.id === selectedPlaceId) ?? null
        : null;
    const routeStatusCopy = buildRouteStatusCopy(selectedTransportMode, routeStatus, routeSegments);
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

    // 추천 전 빈 상태에서는 참여자 위치 칩만 간단히 보여 주기 위해 별도 span 목록을 만듭니다.
    const participantMarkerChips = participantMarkers.map((marker) => (
        <span
            key={marker.id}
            className={`${friendsBodyFont.className} shrink-0 whitespace-nowrap rounded-full bg-[#ede7ff] px-2.5 py-1 text-[10px] text-[#5f47d2] sm:px-3 sm:text-[11px]`}
        >
            {marker.label}
        </span>
    ));

    return (
        <ChatSectionCard className="flex h-full flex-col px-3 py-3.5 sm:px-4 sm:py-5 lg:px-5 xl:px-5">
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
                    <RecommendationModeBadge modeLabel={recommendationSummary.modeLabel} emphasized />
                </div>

                {/* 추천 결과 유무에 따라 장소 칩 목록 또는 참여자 칩 요약만 보여 줍니다. */}
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

                {selectedPlaceMarker ? (
                    <div className="space-y-2 rounded-[18px] border border-[#ddd8ff] bg-[linear-gradient(180deg,rgba(248,246,255,0.98)_0%,rgba(241,237,255,0.9)_100%)] px-3 py-3 sm:px-3.5 sm:py-3.5">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <p className={`${friendsHeadingFont.className} text-[13px] text-[#1d114f] sm:text-[15px]`}>
                                {selectedPlaceMarker.label} 길찾기 준비
                            </p>
                            <p className={`${friendsBodyFont.className} text-[11px] leading-[1.5] text-[#6a6690] sm:text-[12px]`}>
                                {routeStatusCopy}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {TRANSPORT_MODE_OPTIONS.map((option) => {
                                const isActive = option.mode === selectedTransportMode;

                                return (
                                    <button
                                        key={option.mode}
                                        type="button"
                                        onClick={() => onTransportModeSelect(option.mode)}
                                        className={`${friendsDisplayFont.className} inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] transition-colors sm:min-h-10 sm:px-3.5 sm:text-[12px] ${isActive
                                            ? "border-[#6f5ef9] bg-[#6f5ef9] text-white shadow-[0px_8px_18px_rgba(111,94,249,0.22)]"
                                            : "border-[#d9d4ff] bg-white text-[#544b88] hover:bg-[#f4f1ff]"}`}
                                    >
                                        <TransportModeButtonIcon mode={option.mode} />
                                        <span>{option.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {routeStatus === "ready" && routeSegments.length > 0 ? (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {routeSegments.map((segment) => (
                                    <span
                                        key={`${segment.owner}:${segment.mode}`}
                                        className={`${friendsBodyFont.className} inline-flex items-center gap-1 rounded-full border border-[#d9d4ff] bg-white/80 px-2.5 py-1 text-[10px] text-[#4d4771] sm:text-[11px]`}
                                    >
                                        <span className="font-semibold text-[#2b2373]">{buildRouteSegmentLabel(segment)}</span>
                                        <span>{segment.durationText ?? "시간 미정"}</span>
                                        <span>·</span>
                                        <span>{segment.distanceText ?? "거리 미정"}</span>
                                    </span>
                                ))}
                            </div>
                        ) : null}

                        {shouldShowExternalRouteLinks ? (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {routeOriginMarkers.map((marker) => (
                                    <button
                                        key={`kakao-map-link:${marker.id}`}
                                        type="button"
                                        onClick={() => {
                                            void openExternalRouteLink(marker);
                                        }}
                                        disabled={pendingExternalRouteLinkId !== null}
                                        className={`${friendsDisplayFont.className} inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#d9d4ff] bg-white px-3 py-1.5 text-[11px] text-[#544b88] transition-colors hover:bg-[#f4f1ff] disabled:cursor-wait disabled:opacity-70 sm:min-h-10 sm:px-3.5 sm:text-[12px]`}
                                    >
                                        <span className="font-semibold text-[#2b2373]">{marker.id === "me" ? "내 위치" : "친구 위치"}</span>
                                        <span>{pendingExternalRouteLinkId === marker.id ? "주소 확인 중..." : "카카오맵에서 확인"}</span>
                                    </button>
                                ))}
                            </div>
                        ) : null}

                        {routeStatus === "error" && routeErrorMessage ? (
                            <p className={`${friendsBodyFont.className} text-[11px] leading-[1.5] text-[#a63d5d] sm:text-[12px]`}>
                                {routeErrorMessage}
                            </p>
                        ) : null}
                    </div>
                ) : null}
            </div>

            {/* 지도 본문은 항상 렌더하되 내부에서 loading/error/ready 상태를 스스로 처리합니다. */}
            <div className="mt-2 flex-1 rounded-[20px] border border-[#ddd8ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(241,237,255,0.92)_100%)] px-1.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] sm:mt-2.5 sm:px-3 sm:py-3">
                <KakaoMapPreview
                    markers={mapMarkers}
                    selectedMarkerId={focusedMarkerId}
                    routeSegments={routeStatus === "ready" ? routeSegments : []}
                    onMarkerSelect={onMarkerSelect}
                />
            </div>
        </ChatSectionCard>
    );
}