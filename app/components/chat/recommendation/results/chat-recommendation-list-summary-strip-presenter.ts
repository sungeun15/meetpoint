import {
    buildRecommendationListCountBadgeCopy,
    buildRecommendationListSummaryCopy,
} from "../chat-recommendation-copy";

type BuildRecommendationListSummaryStripPresenterArgs = {
    recommendationCount: number; // 현재 화면에 구성된 추천 카드 수입니다.
    maxRecommendationCount: number; // 설계상 보여 줄 최대 추천 개수입니다.
};

// 추천 카드 리스트 상단의 요약 문구와 개수 배지를 한 번에 계산합니다.
export function buildRecommendationListSummaryStripPresenter({
    recommendationCount,
    maxRecommendationCount,
}: BuildRecommendationListSummaryStripPresenterArgs) {
    return {
        summaryCopy: buildRecommendationListSummaryCopy(maxRecommendationCount),
        countBadgeCopy: buildRecommendationListCountBadgeCopy(recommendationCount),
    };
}