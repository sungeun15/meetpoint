import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../../../friends/fonts";
import { buildRecommendationSummaryCardPresenter } from "./chat-recommendation-summary-card-presenter";
import { RecommendationModeBadge } from "../chat-recommendation-shared";
import { RecommendationSummarySections } from "./chat-recommendation-summary-sections";
import type { RecommendationSummary } from "../../types";

type RecommendationSummaryCardProps = {
    recommendationSummary: RecommendationSummary; // 추천 결과 상단에 노출할 모드/카테고리/출발지 요약 데이터입니다.
};

// 추천 결과 상단의 제목, 모바일 스트립, 상세 섹션을 묶는 요약 카드입니다.
export function RecommendationSummaryCard({ recommendationSummary }: RecommendationSummaryCardProps) {
    const presenter = buildRecommendationSummaryCardPresenter(recommendationSummary);

    return (
        <article className="min-w-0 rounded-[18px] bg-white/92 px-3 py-2 shadow-[0px_12px_30px_rgba(52,41,104,0.1)] sm:px-4 sm:py-4">
            <div className="flex min-w-0 items-center justify-between gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h4 className={`${friendsHeadingFont.className} min-w-0 text-[16px] text-[#111827] sm:text-[20px]`}>
                    {presenter.title}
                </h4>
                <RecommendationModeBadge modeLabel={recommendationSummary.modeLabel} />
            </div>

            {/* 모바일에서는 카테고리와 출발지만 짧게 먼저 보여 주고 상세 정보는 아래 섹션으로 이어집니다. */}
            <div className="mt-1.5 flex min-w-0 flex-col items-start gap-1.5 rounded-2xl bg-[#faf7ff] px-2.5 py-2 sm:hidden">
                <span className={`${friendsBodyFont.className} shrink-0 text-[10px] text-[#6c5ce7]`}>
                    {presenter.mobileStrip.categoryLabel}
                </span>
                <p className={`${friendsDisplayFont.className} min-w-0 break-keep text-[11px] leading-[1.45] text-[#111827]`}>
                    {presenter.mobileStrip.departureLabel}
                </p>
            </div>
            <RecommendationSummarySections recommendationSummary={recommendationSummary} />
        </article>
    );
}