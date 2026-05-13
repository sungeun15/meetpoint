import { useEffect, useRef } from "react";

import { friendsDisplayFont } from "../../../friends/fonts";
import { buildRecommendationResultsSectionLabel } from "../chat-recommendation-copy";
import {
    RecommendationResultsBody,
    RecommendationResultsIntro,
} from "./chat-recommendation-results-state";
import { RecommendationModeBadge } from "../chat-recommendation-shared";
import { ChatSectionCard } from "../../chat-ui";
import type { MeetingMode, RecommendationCard, RecommendationSummary } from "../../types";

type ChatRecommendationResultsPanelProps = {
    meetingMode: MeetingMode; // 지금 만나기/나중에 만나기 중 어떤 추천 시나리오인지 나타냅니다.
    recommendationSummary: RecommendationSummary; // 결과 상단 배지와 요약 카드에 사용할 요약 데이터입니다.
    hasRecommendations: boolean; // 실제 추천 결과가 준비되어 본문을 렌더할 수 있는지 나타냅니다.
    recommendationCards: RecommendationCard[]; // 추천 장소 카드 배열입니다.
    selectedRecommendationId: string | null; // 현재 강조된 추천 카드 id입니다.
    onRecommendationCardSelect: (recommendationId: string) => void; // 카드 선택 이벤트를 상위 상태로 전달합니다.
};

// 추천 결과 섹션 레이아웃과 선택 카드 자동 스크롤 동작을 담당합니다.
export function ChatRecommendationResultsPanel({
    meetingMode,
    recommendationSummary,
    hasRecommendations,
    recommendationCards,
    selectedRecommendationId,
    onRecommendationCardSelect,
}: ChatRecommendationResultsPanelProps) {
    const recommendationButtonRefs = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect(() => {
        if (!selectedRecommendationId) {
            return;
        }

        // 지도나 다른 UI에서 선택이 바뀌면 해당 카드가 목록 안으로 자연스럽게 들어오도록 맞춥니다.
        recommendationButtonRefs.current[selectedRecommendationId]?.scrollIntoView({
            block: "nearest",
            behavior: "smooth",
        });
    }, [selectedRecommendationId]);

    return (
        <ChatSectionCard className="px-3 py-3.5 sm:px-4 sm:py-5 lg:px-5 xl:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className={`${friendsDisplayFont.className} text-[13px] text-[#111827] sm:text-[16px]`}>
                        {buildRecommendationResultsSectionLabel()}
                    </p>
                    <div className="mt-2"><RecommendationResultsIntro hasRecommendations={hasRecommendations} /></div>
                </div>
                <RecommendationModeBadge modeLabel={recommendationSummary.modeLabel} />
            </div>

            <div className="mt-2 rounded-[20px] border border-[#ddd8ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(241,237,255,0.92)_100%)] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] sm:mt-3 sm:px-4 sm:py-4">
                <RecommendationResultsBody
                    meetingMode={meetingMode}
                    hasRecommendations={hasRecommendations}
                    recommendationSummary={recommendationSummary}
                    recommendationCards={recommendationCards}
                    selectedRecommendationId={selectedRecommendationId}
                    recommendationButtonRefs={recommendationButtonRefs}
                    onRecommendationCardSelect={onRecommendationCardSelect}
                />
            </div>
        </ChatSectionCard>
    );
}