import { friendsBodyFont } from "../../../friends/fonts";
import { buildRecommendationListSummaryStripPresenter } from "./chat-recommendation-list-summary-strip-presenter";

type RecommendationListSummaryStripProps = {
    recommendationCount: number; // 현재 렌더할 추천 카드 수입니다.
    maxRecommendationCount: number; // 설계상 노출 가능한 최대 추천 개수입니다.
};

// 추천 카드 리스트 상단의 안내 문구와 개수 배지를 렌더합니다.
export function RecommendationListSummaryStrip({
    recommendationCount,
    maxRecommendationCount,
}: RecommendationListSummaryStripProps) {
    const presenter = buildRecommendationListSummaryStripPresenter({
        recommendationCount,
        maxRecommendationCount,
    });

    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {/* 보조 설명은 화면 여유가 있는 데스크톱 이상에서만 노출합니다. */}
            <p className={`${friendsBodyFont.className} hidden text-[11px] text-[#5f6782] sm:block sm:text-[13px]`}>
                {presenter.summaryCopy}
            </p>
            <span className={`${friendsBodyFont.className} w-fit rounded-full bg-white px-2.5 py-1 text-[10px] text-[#5f47d2] shadow-[0px_8px_18px_rgba(43,35,115,0.08)] sm:px-3 sm:text-[11px]`}>
                {presenter.countBadgeCopy}
            </span>
        </div>
    );
}