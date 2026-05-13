import type { MutableRefObject } from "react";

import { friendsHeadingFont } from "../../../friends/fonts";
import { RecommendationCardItem } from "../card/chat-recommendation-card-item";
import {
    buildRecommendationListToggleLabel,
} from "../chat-recommendation-copy";
import { buildRecommendationCardListContainerClassName } from "./chat-recommendation-results-content-layout";
import { RecommendationListSummaryStrip } from "./chat-recommendation-list-summary-strip";
import { useRecommendationListController } from "./use-recommendation-list-controller";
import { MAX_RECOMMENDATION_COUNT } from "../chat-recommendation-data";
import type { RecommendationCard } from "../../types";

type RecommendationCardListProps = {
    recommendationCards: RecommendationCard[]; // 추천 결과로 계산된 카드 목록 전체입니다.
    selectedRecommendationId: string | null; // 현재 지도/상세와 동기화된 선택 카드 id입니다.
    recommendationButtonRefs: MutableRefObject<Record<string, HTMLDivElement | null>>; // 선택 카드로 스크롤하기 위해 카드 DOM ref를 id별로 보관합니다.
    onRecommendationCardSelect: (recommendationId: string) => void; // 카드 선택 시 상위 상태에 선택 id를 전달합니다.
};
export { RecommendationSummaryCard } from "../summary/chat-recommendation-summary-card";

// 추천 결과 카드 리스트와 모바일 펼침 버튼을 함께 렌더합니다.
export function RecommendationCardList({
    recommendationCards,
    selectedRecommendationId,
    recommendationButtonRefs,
    onRecommendationCardSelect,
}: RecommendationCardListProps) {
    const {
        isMobileListExpanded,
        hasRecommendationOverflow,
        hasMobileCollapsedCards,
        mobileVisibleCardCount,
        toggleMobileListExpanded,
        isHiddenOnMobile,
    } = useRecommendationListController({ recommendationCount: recommendationCards.length });
    // 카드 개수와 현재 펼침 상태를 바탕으로 컨테이너 스크롤 영역을 계산합니다.
    const cardListContainerClassName = buildRecommendationCardListContainerClassName({
        isMobileListExpanded,
        hasMobileCollapsedCards,
        hasRecommendationOverflow,
    });

    return (
        <div className="rounded-[18px] border border-white/70 bg-white/38 px-1.5 py-1.5 sm:px-3 sm:py-3">
            <RecommendationListSummaryStrip
                recommendationCount={recommendationCards.length}
                maxRecommendationCount={MAX_RECOMMENDATION_COUNT}
            />

            <div className={cardListContainerClassName}>
                {recommendationCards.map((recommendationCard, index) => {
                    const isSelected = selectedRecommendationId === recommendationCard.id;

                    return (
                        <RecommendationCardItem
                            key={recommendationCard.id}
                            recommendationCard={recommendationCard}
                            isSelected={isSelected}
                            isHiddenOnMobile={isHiddenOnMobile(index, isSelected)}
                            onSelect={onRecommendationCardSelect}
                            registerElement={(element) => {
                                recommendationButtonRefs.current[recommendationCard.id] = element;
                            }}
                        />
                    );
                })}
            </div>

            {/* 모바일 기본 노출 수를 넘길 때만 펼치기 버튼을 보여 줍니다. */}
            {hasMobileCollapsedCards ? (
                <button
                    type="button"
                    onClick={toggleMobileListExpanded}
                    className={`${friendsHeadingFont.className} mt-2.5 flex w-full items-center justify-center rounded-[14px] border border-[#ddd8ff] bg-white/82 px-3 py-2.5 text-[13px] text-[#5f47d2] shadow-[0px_10px_22px_rgba(52,41,104,0.08)] sm:hidden`}
                >
                    {buildRecommendationListToggleLabel(
                        isMobileListExpanded,
                        Math.min(mobileVisibleCardCount, recommendationCards.length),
                    )}
                </button>
            ) : null}
        </div>
    );
}