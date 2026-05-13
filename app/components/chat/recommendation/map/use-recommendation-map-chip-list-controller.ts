import { useState } from "react";

const MOBILE_VISIBLE_PLACE_CHIP_COUNT = 3;

type UseRecommendationMapChipListControllerArgs = {
    placeMarkerCount: number; // 현재 추천 장소 마커가 몇 개인지 나타냅니다.
};

// 모바일에서 장소 칩을 일부만 먼저 보여 주고 펼치기 상태를 관리합니다.
export function useRecommendationMapChipListController({
    placeMarkerCount,
}: UseRecommendationMapChipListControllerArgs) {
    const [isMobilePlaceChipExpanded, setIsMobilePlaceChipExpanded] = useState(false);
    // 기본 노출 개수를 넘기는 순간부터 접힘/펼침 UI를 활성화합니다.
    const hasCollapsedPlaceChips = placeMarkerCount > MOBILE_VISIBLE_PLACE_CHIP_COUNT;

    // 접힌 상태와 펼친 상태를 토글합니다.
    function toggleMobilePlaceChipExpanded() {
        setIsMobilePlaceChipExpanded((currentValue) => !currentValue);
    }

    // 모바일에서 기본 노출 개수를 넘는 칩은 활성 칩이 아닌 경우 숨깁니다.
    function isPlaceChipHiddenOnMobile(index: number, markerId: string, activeMarkerId: string | null) {
        return hasCollapsedPlaceChips
            && !isMobilePlaceChipExpanded
            && index >= MOBILE_VISIBLE_PLACE_CHIP_COUNT
            && activeMarkerId !== markerId;
    }

    return {
        hasCollapsedPlaceChips,
        isMobilePlaceChipExpanded,
        mobileVisiblePlaceChipCount: MOBILE_VISIBLE_PLACE_CHIP_COUNT,
        toggleMobilePlaceChipExpanded,
        isPlaceChipHiddenOnMobile,
    };
}