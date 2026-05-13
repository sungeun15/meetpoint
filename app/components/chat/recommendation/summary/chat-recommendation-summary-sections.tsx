import { friendsBodyFont, friendsDisplayFont } from "../../../friends/fonts";
import { buildRecommendationSummarySections } from "./chat-recommendation-summary-sections-presenter";
import type { RecommendationSummary } from "../../types";

type RecommendationSummarySectionsProps = {
    recommendationSummary: RecommendationSummary; // 추천 모드, 카테고리, 출발지 요약 등 상단 섹션이 읽을 데이터 묶음입니다.
};

// 데스크톱 이상 화면에서 추천 결과 핵심 정보를 2열 요약 섹션으로 보여 줍니다.
export function RecommendationSummarySections({ recommendationSummary }: RecommendationSummarySectionsProps) {
    const sections = buildRecommendationSummarySections(recommendationSummary);

    return (
        <div className="mt-2.5 hidden gap-2 sm:mt-4 sm:grid sm:gap-3 sm:grid-cols-2">
            {sections.map((section) => (
                <div key={section.id} className={section.containerClassName}>
                    <p className={`${friendsBodyFont.className} text-[11px] uppercase tracking-[0.18em] text-[#8a7be5]`}>
                        {section.label}
                    </p>
                    <p className={`${friendsDisplayFont.className} ${section.valueClassName}`}>
                        {section.value}
                    </p>
                </div>
            ))}
        </div>
    );
}