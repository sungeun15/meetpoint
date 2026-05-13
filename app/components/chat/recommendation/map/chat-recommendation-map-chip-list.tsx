import { friendsHeadingFont } from "../../../friends/fonts";
import { buildRecommendationMapChipListPresenter } from "./chat-recommendation-map-chip-list-presenter";
import {
    RecommendationMapParticipantChipRow,
    RecommendationMapPlaceChipRow,
} from "./chat-recommendation-map-chip-rows";
import { useRecommendationMapChipListController } from "./use-recommendation-map-chip-list-controller";
import type { MapMarker } from "../../types";

type RecommendationMapChipListProps = {
    participantMarkers: MapMarker[]; // 내 위치, 친구 위치, 중심점 같은 비장소 마커 목록입니다.
    placeMarkers: MapMarker[]; // 추천 장소에 해당하는 마커 목록입니다.
    activeMarkerId: string | null; // 현재 강조된 장소 마커 id입니다.
    onPlaceChipSelect: (markerId: string) => void; // 장소 칩 클릭 시 상위 상태에 선택을 전달합니다.
};

// 지도 상단의 참여자 칩, 장소 칩, 모바일 토글 버튼을 묶어서 렌더합니다.
export function RecommendationMapChipList({
    participantMarkers,
    placeMarkers,
    activeMarkerId,
    onPlaceChipSelect,
}: RecommendationMapChipListProps) {
    // 모바일에서는 장소 칩을 일부만 먼저 보여 주고, 필요 시 펼칠 수 있게 제어합니다.
    const {
        hasCollapsedPlaceChips,
        isMobilePlaceChipExpanded,
        mobileVisiblePlaceChipCount,
        toggleMobilePlaceChipExpanded,
        isPlaceChipHiddenOnMobile,
    } = useRecommendationMapChipListController({ placeMarkerCount: placeMarkers.length });
    const presenter = buildRecommendationMapChipListPresenter({
        hasCollapsedPlaceChips,
        isMobilePlaceChipExpanded,
        mobileVisiblePlaceChipCount,
    });

    return (
        <div className="mt-2.5 min-w-0 space-y-1.5 sm:mt-3 sm:space-y-2">
            {/* 참여자 칩은 항상 읽기 전용으로 먼저 보여 주고, 장소 칩은 선택 가능한 행으로 따로 분리합니다. */}
            <RecommendationMapParticipantChipRow participantMarkers={participantMarkers} />
            <RecommendationMapPlaceChipRow
                placeMarkers={placeMarkers}
                activeMarkerId={activeMarkerId}
                isPlaceChipHiddenOnMobile={isPlaceChipHiddenOnMobile}
                onPlaceChipSelect={onPlaceChipSelect}
            />
            {/* 모바일 화면에서만 장소 칩 펼치기 버튼을 추가해 세로 길이를 제어합니다. */}
            {presenter.shouldRenderToggleButton ? (
                <button
                    type="button"
                    onClick={toggleMobilePlaceChipExpanded}
                    className={`${friendsHeadingFont.className} flex w-full items-center justify-center rounded-[14px] border border-[#ddd8ff] bg-white/82 px-3 py-2 text-[12px] text-[#5f47d2] shadow-[0px_10px_22px_rgba(52,41,104,0.08)] sm:hidden`}
                >
                    {presenter.toggleButtonLabel}
                </button>
            ) : null}
        </div>
    );
}