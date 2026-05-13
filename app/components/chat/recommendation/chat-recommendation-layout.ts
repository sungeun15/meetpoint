// 추천 지도 프리뷰가 너무 작아지지 않도록 화면 크기별 최소 높이를 고정합니다.
export const KAKAO_MAP_MIN_HEIGHT_CLASS = "min-h-[220px] sm:min-h-[400px] lg:min-h-[694px]";

// 추천 결과가 비어 있을 때도 카드 영역 레이아웃이 급격히 줄어들지 않게 최소 높이를 유지합니다.
export const EMPTY_RECOMMENDATION_RESULTS_MIN_HEIGHT_CLASS = "min-h-[180px] sm:min-h-[320px] lg:min-h-[864px]";

// 지도 bounds 재계산 시 패널 여백과 UI 오버레이를 고려한 padding 값입니다.
export const MAP_BOUNDS_PADDING = {
    top: 56,
    right: 40,
    bottom: 40,
    left: 40,
} as const;