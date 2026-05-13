import { useState } from "react";

const VISIBLE_RECOMMENDATION_CARD_COUNT = 4;
const MOBILE_VISIBLE_RECOMMENDATION_CARD_COUNT = 2;

type UseRecommendationListControllerArgs = {
    recommendationCount: number; // 현재 추천 카드가 몇 개인지 나타냅니다.
};

// 추천 카드 목록의 모바일 펼침 상태와 숨김 규칙을 관리하는 훅입니다.
export function useRecommendationListController({ recommendationCount }: UseRecommendationListControllerArgs) {
    const [isMobileListExpanded, setIsMobileListExpanded] = useState(false);
    const hasRecommendationOverflow = recommendationCount > VISIBLE_RECOMMENDATION_CARD_COUNT;
    const hasMobileCollapsedCards = recommendationCount > MOBILE_VISIBLE_RECOMMENDATION_CARD_COUNT;

    // 모바일 목록 토글 버튼에서 접힘/펼침 상태를 반전합니다.
    function toggleMobileListExpanded() {
        setIsMobileListExpanded((currentValue) => !currentValue);
    }

    // 기본 노출 개수를 넘는 카드는 모바일 접힘 상태에서만 숨깁니다.
    function isHiddenOnMobile(index: number, isSelected: boolean) {
        return hasMobileCollapsedCards
            && !isMobileListExpanded
            && index >= MOBILE_VISIBLE_RECOMMENDATION_CARD_COUNT
            && !isSelected;
    }

    return {
        isMobileListExpanded,
        hasRecommendationOverflow,
        hasMobileCollapsedCards,
        mobileVisibleCardCount: MOBILE_VISIBLE_RECOMMENDATION_CARD_COUNT,
        toggleMobileListExpanded,
        isHiddenOnMobile,
    };
}