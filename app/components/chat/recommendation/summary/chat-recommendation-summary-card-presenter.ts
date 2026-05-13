import type { RecommendationSummary } from "../../types";

type RecommendationSummaryMobileStrip = {
    categoryLabel: string; // 모바일 요약 칩에서 보여 줄 추천 카테고리 라벨입니다.
    departureLabel: string; // 모바일 한 줄 요약에서 강조할 출발지 요약 문구입니다.
};

// 요약 카드에서 화면 표시만 담당하는 최소 데이터 구조를 만듭니다.
export function buildRecommendationSummaryCardPresenter(
    recommendationSummary: RecommendationSummary,
) {
    const mobileStrip: RecommendationSummaryMobileStrip = {
        categoryLabel: recommendationSummary.categoryLabel,
        departureLabel: recommendationSummary.departureLabel,
    };

    return {
        title: "추천 결과 요약",
        mobileStrip,
    };
}