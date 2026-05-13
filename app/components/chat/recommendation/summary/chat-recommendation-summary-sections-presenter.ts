import type { RecommendationSummary } from "../../types";

type RecommendationSummarySection = {
    id: "category" | "departure" | "midpoint" | "scoring"; // 어떤 요약 섹션인지 구분하는 식별자입니다.
    label: string; // 섹션 상단에 표시할 항목 이름입니다.
    value: string; // 섹션 본문에 노출할 실제 요약 문구입니다.
    containerClassName: string; // 섹션 카드 외곽 스타일을 제어하는 클래스입니다.
    valueClassName: string; // 값 텍스트의 줄바꿈/크기 스타일을 제어하는 클래스입니다.
};

// 추천 요약 데이터를 화면 섹션 배열로 변환합니다.
export function buildRecommendationSummarySections(
    recommendationSummary: RecommendationSummary,
): RecommendationSummarySection[] {
    return [
        {
            id: "category",
            label: "카테고리",
            value: recommendationSummary.categoryLabel,
            containerClassName: "rounded-[14px] bg-[#faf7ff] px-2.5 py-2 sm:px-3 sm:py-3",
            valueClassName: "mt-1 text-[12px] text-[#111827] sm:mt-2 sm:text-[15px]",
        },
        {
            id: "departure",
            label: "출발 기준",
            value: recommendationSummary.departureLabel,
            containerClassName: "rounded-[14px] bg-[#faf7ff] px-2.5 py-2 sm:px-3 sm:py-3",
            valueClassName: "mt-1 whitespace-pre-line text-[12px] leading-[1.45] text-[#111827] sm:mt-2 sm:text-[15px]",
        },
        {
            id: "midpoint",
            label: "중심 기준",
            value: recommendationSummary.midpointLabel,
            containerClassName: "rounded-[14px] bg-[#faf7ff] px-2.5 py-2 sm:px-3 sm:py-3",
            valueClassName: "mt-1 whitespace-pre-line text-[12px] leading-[1.45] text-[#111827] sm:mt-2 sm:text-[15px]",
        },
        {
            id: "scoring",
            label: "점수 반영",
            value: recommendationSummary.scoringLabel,
            containerClassName: "hidden rounded-[14px] bg-[#faf7ff] px-3 py-3 sm:block",
            valueClassName: "mt-1.5 text-[13px] leading-[1.55] text-[#111827] sm:mt-2 sm:text-[15px]",
        },
    ];
}