import { buildRecommendationMapPlaceChipToggleLabel } from "../chat-recommendation-copy";

type BuildRecommendationMapChipListPresenterArgs = {
    hasCollapsedPlaceChips: boolean; // 모바일에서 접힌 상태의 장소 칩이 남아 있는지 나타냅니다.
    isMobilePlaceChipExpanded: boolean; // 모바일에서 칩 목록을 펼친 상태인지 나타냅니다.
    mobileVisiblePlaceChipCount: number; // 기본으로 먼저 보여 줄 모바일 칩 개수입니다.
};

// 장소 칩 토글 버튼의 노출 여부와 라벨을 계산합니다.
export function buildRecommendationMapChipListPresenter({
    hasCollapsedPlaceChips,
    isMobilePlaceChipExpanded,
    mobileVisiblePlaceChipCount,
}: BuildRecommendationMapChipListPresenterArgs) {
    return {
        // 모바일에서 숨겨진 장소 칩이 남아 있을 때만 토글 버튼이 필요합니다.
        shouldRenderToggleButton: hasCollapsedPlaceChips,
        toggleButtonLabel: buildRecommendationMapPlaceChipToggleLabel(
            isMobilePlaceChipExpanded,
            mobileVisiblePlaceChipCount,
        ),
    };
}