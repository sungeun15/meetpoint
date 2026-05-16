import type { MutableRefObject } from "react";

import { friendsDisplayFont, friendsHeadingFont } from "../../../friends/fonts";
import { EMPTY_RECOMMENDATION_RESULTS_MIN_HEIGHT_CLASS } from "../chat-recommendation-layout";
import {
    RecommendationCardList,
    RecommendationSummaryCard,
} from "./chat-recommendation-results-content";
import {
    buildRecommendationResultsEmptyPresenter,
    buildRecommendationResultsIntroPresenter,
} from "./chat-recommendation-results-state-presenter";
import type { MeetingMode, RecommendationCard, RecommendationSummary } from "../../types";

type RecommendationResultsIntroProps = {
    hasRecommendations: boolean; // 추천 결과가 준비됐는지에 따라 안내 문구를 달리하기 위한 상태값입니다.
};

// 추천 결과 영역 상단의 제목과 보조 설명 문구를 렌더합니다.
export function RecommendationResultsIntro({ hasRecommendations }: RecommendationResultsIntroProps) {
    const presenter = buildRecommendationResultsIntroPresenter(hasRecommendations);

    return (
        <>
            <p className={`${friendsHeadingFont.className} text-[13px] text-[#111827] sm:text-[15px]`}>
                {presenter.title}
            </p>
            <p className={`${friendsDisplayFont.className} mt-2 hidden text-[13px] leading-[1.6] text-[#5f6782] sm:block sm:text-[14px]`}>
                {presenter.copy}
            </p>
        </>
    );
}

type RecommendationResultsBodyProps = {
    meetingMode: MeetingMode; // 빈 상태 문구에서 현재 추천 시나리오를 설명할 때 사용합니다.
    hasRecommendations: boolean; // 추천 결과 존재 여부에 따라 빈 상태와 실제 리스트를 분기합니다.
    recommendationSummary: RecommendationSummary; // 추천 결과 요약 카드에 전달할 데이터입니다.
    recommendationCards: RecommendationCard[]; // 추천 카드 목록입니다.
    selectedRecommendationId: string | null; // 현재 선택된 카드 id입니다.
    recommendationButtonRefs: MutableRefObject<Record<string, HTMLDivElement | null>>; // 카드 스크롤 이동을 위해 DOM ref를 모아 둔 객체입니다.
    onRecommendationCardSelect: (recommendationId: string) => void; // 카드 선택 시 상위에 알릴 콜백입니다.
};

// 추천 결과가 있을 때와 없을 때의 본문 UI를 분기해서 렌더합니다.
export function RecommendationResultsBody({
    meetingMode,
    hasRecommendations,
    recommendationSummary,
    recommendationCards,
    selectedRecommendationId,
    recommendationButtonRefs,
    onRecommendationCardSelect,
}: RecommendationResultsBodyProps) {
    const emptyPresenter = buildRecommendationResultsEmptyPresenter(meetingMode);

    if (hasRecommendations) {
        return (
            <div className="min-w-0 grid gap-3">
                <RecommendationSummaryCard recommendationSummary={recommendationSummary} />
                <RecommendationCardList
                    recommendationCards={recommendationCards}
                    selectedRecommendationId={selectedRecommendationId}
                    recommendationButtonRefs={recommendationButtonRefs}
                    onRecommendationCardSelect={onRecommendationCardSelect}
                />
            </div>
        );
    }

    // 추천 전에는 최소 높이를 유지한 빈 상태 카드를 보여 레이아웃이 갑자기 줄어들지 않게 합니다.
    return (
        <div className={`flex ${EMPTY_RECOMMENDATION_RESULTS_MIN_HEIGHT_CLASS} flex-col items-center justify-center rounded-[18px] border border-dashed border-white/70 bg-white/55 px-3 py-4 text-center sm:px-4 sm:py-8`}>
            <p className={`${friendsHeadingFont.className} break-keep text-[15px] text-[#111827] sm:text-[20px] lg:text-[22px]`}>
                {emptyPresenter.title}
            </p>
            <p className={`${friendsDisplayFont.className} break-keep mt-1 text-[11px] leading-normal text-[#6b7280] sm:mt-2 sm:text-[14px] lg:text-[15px]`}>
                {emptyPresenter.copy}
            </p>
        </div>
    );
}