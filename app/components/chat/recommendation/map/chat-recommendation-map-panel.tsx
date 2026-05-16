import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../../../friends/fonts";
import { RecommendationMapChipList } from "./chat-recommendation-map-chip-list";
import { buildRecommendationMapPanelPresenter } from "./chat-recommendation-map-panel-presenter";
import { KakaoMapPreview } from "./kakao-map-preview";
import { RecommendationModeBadge } from "../chat-recommendation-shared";
import { ChatSectionCard } from "../../chat-ui";
import type { MapMarker, RecommendationSummary } from "../../types";

type ChatRecommendationMapPanelProps = {
    recommendationSummary: RecommendationSummary; // 현재 추천 모드와 요약 라벨 묶음입니다.
    hasRecommendations: boolean; // 실제 추천 결과가 준비된 상태인지 나타냅니다.
    mapMarkers: MapMarker[]; // 지도와 칩 목록에 함께 반영할 전체 마커 배열입니다.
    activeMarkerId: string | null; // 칩 목록에서 현재 활성화된 장소 마커 id입니다.
    focusedMarkerId: string | null; // 지도에서 강조 표시할 마커 id입니다.
    onMarkerSelect: (markerId: string) => void; // 지도 마커 클릭 시 선택 상태를 갱신합니다.
    onPlaceChipSelect: (markerId: string) => void; // 장소 칩 클릭 시 해당 마커를 활성화합니다.
};

// 추천 지도 패널의 헤더, 장소 칩 목록, 지도 프리뷰를 한 번에 구성합니다.
export function ChatRecommendationMapPanel({
    recommendationSummary,
    hasRecommendations,
    mapMarkers,
    activeMarkerId,
    focusedMarkerId,
    onMarkerSelect,
    onPlaceChipSelect,
}: ChatRecommendationMapPanelProps) {
    // 사람 마커와 장소 마커를 분리해 헤더/칩 영역에 각각 맞게 사용합니다.
    const participantMarkers = mapMarkers.filter((marker) => marker.markerType !== "place");
    const placeMarkers = mapMarkers.filter((marker) => marker.markerType === "place");
    const presenter = buildRecommendationMapPanelPresenter({
        hasRecommendations,
        participantMarkerCount: participantMarkers.length,
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
            </div>

            {/* 지도 본문은 항상 렌더하되 내부에서 loading/error/ready 상태를 스스로 처리합니다. */}
            <div className="mt-2 flex-1 rounded-[20px] border border-[#ddd8ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(241,237,255,0.92)_100%)] px-1.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] sm:mt-2.5 sm:px-3 sm:py-3">
                <KakaoMapPreview
                    markers={mapMarkers}
                    selectedMarkerId={focusedMarkerId}
                    onMarkerSelect={onMarkerSelect}
                />
            </div>
        </ChatSectionCard>
    );
}