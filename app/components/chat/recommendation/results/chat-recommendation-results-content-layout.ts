type BuildRecommendationCardListContainerClassNameArgs = {
    isMobileListExpanded: boolean; // 모바일에서 추천 카드 목록을 펼친 상태인지 나타냅니다.
    hasMobileCollapsedCards: boolean; // 모바일 기본 노출 개수를 넘는 카드가 있는지 나타냅니다.
    hasRecommendationOverflow: boolean; // 데스크톱에서도 스크롤 영역이 필요할 만큼 카드가 많은지 나타냅니다.
};

// 카드 수와 모바일 펼침 상태에 따라 목록 컨테이너의 높이와 스크롤 클래스를 결정합니다.
export function buildRecommendationCardListContainerClassName({
    isMobileListExpanded,
    hasMobileCollapsedCards,
    hasRecommendationOverflow,
}: BuildRecommendationCardListContainerClassNameArgs) {
    return `mt-2.5 grid gap-1.5 ${isMobileListExpanded && hasMobileCollapsedCards ? "max-h-[18rem] overflow-y-auto pr-1.5" : ""} ${hasRecommendationOverflow ? "sm:mt-3 sm:max-h-[30rem] sm:gap-2.5 sm:overflow-y-auto sm:pr-2 2xl:max-h-[32rem]" : "sm:mt-3 sm:gap-2.5"}`;
}