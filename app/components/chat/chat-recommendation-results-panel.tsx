import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../friends/fonts";
import { ChatSectionCard } from "./chat-ui";
import type { MeetingMode, RecommendationCard, RecommendationSummary } from "./types";

type ChatRecommendationResultsPanelProps = {
    meetingMode: MeetingMode;
    recommendationSummary: RecommendationSummary;
    hasRecommendations: boolean;
    recommendationCards: RecommendationCard[];
};

export function ChatRecommendationResultsPanel({
    meetingMode,
    recommendationSummary,
    hasRecommendations,
    recommendationCards,
}: ChatRecommendationResultsPanelProps) {
    function renderRecommendationResultArea() {
        if (hasRecommendations) {
            return (
                <div className="grid gap-3">
                    <article className="rounded-[18px] bg-white/92 px-4 py-4 shadow-[0px_12px_30px_rgba(52,41,104,0.1)]">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <h4 className={`${friendsHeadingFont.className} text-[18px] text-[#111827] sm:text-[20px]`}>
                                추천 결과 요약
                            </h4>
                            <span className={`${friendsBodyFont.className} w-fit rounded-full bg-[#f3eeff] px-3 py-1 text-[11px] text-[#6c5ce7] sm:text-[12px]`}>
                                {recommendationSummary.modeLabel}
                            </span>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-[14px] bg-[#faf7ff] px-3 py-3">
                                <p className={`${friendsBodyFont.className} text-[11px] uppercase tracking-[0.18em] text-[#8a7be5]`}>
                                    카테고리
                                </p>
                                <p className={`${friendsDisplayFont.className} mt-2 text-[14px] text-[#111827] sm:text-[15px]`}>
                                    {recommendationSummary.categoryLabel}
                                </p>
                            </div>
                            <div className="rounded-[14px] bg-[#faf7ff] px-3 py-3">
                                <p className={`${friendsBodyFont.className} text-[11px] uppercase tracking-[0.18em] text-[#8a7be5]`}>
                                    출발 기준
                                </p>
                                <p className={`${friendsDisplayFont.className} mt-2 text-[14px] text-[#111827] sm:text-[15px]`}>
                                    {recommendationSummary.departureLabel}
                                </p>
                            </div>
                            <div className="rounded-[14px] bg-[#faf7ff] px-3 py-3">
                                <p className={`${friendsBodyFont.className} text-[11px] uppercase tracking-[0.18em] text-[#8a7be5]`}>
                                    중심 기준
                                </p>
                                <p className={`${friendsDisplayFont.className} mt-2 text-[14px] leading-[1.55] text-[#111827] sm:text-[15px]`}>
                                    {recommendationSummary.midpointLabel}
                                </p>
                            </div>
                            <div className="rounded-[14px] bg-[#faf7ff] px-3 py-3">
                                <p className={`${friendsBodyFont.className} text-[11px] uppercase tracking-[0.18em] text-[#8a7be5]`}>
                                    점수 반영
                                </p>
                                <p className={`${friendsDisplayFont.className} mt-2 text-[14px] leading-[1.55] text-[#111827] sm:text-[15px]`}>
                                    {recommendationSummary.scoringLabel}
                                </p>
                            </div>
                        </div>
                    </article>

                    {recommendationCards.map((recommendationCard) => (
                        <article
                            key={recommendationCard.id}
                            className="rounded-[18px] bg-white/90 px-4 py-4 shadow-[0px_12px_30px_rgba(52,41,104,0.1)]"
                        >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className={`${friendsHeadingFont.className} break-keep text-[18px] text-[#111827] sm:text-[20px] lg:text-[22px]`}>
                                        {recommendationCard.rank}. {recommendationCard.name}
                                    </p>
                                    <p className={`${friendsBodyFont.className} mt-1 text-[12px] text-[#6c5ce7] sm:text-[13px] lg:text-[14px]`}>
                                        {recommendationCard.category}
                                    </p>
                                </div>
                                <div className={`${friendsBodyFont.className} w-fit rounded-full bg-[#f3eeff] px-3 py-1 text-[11px] text-[#6c5ce7] sm:text-[12px]`}>
                                    나 {recommendationCard.myDistance} · 친구 {recommendationCard.friendDistance}
                                </div>
                            </div>
                            <p className={`${friendsDisplayFont.className} break-keep mt-3 text-[13px] leading-[1.6] text-[#4a5568] sm:text-[14px] lg:text-[15px]`}>
                                {recommendationCard.summary}
                            </p>
                        </article>
                    ))}
                </div>
            );
        }

        return (
            <div className="rounded-[18px] border border-dashed border-white/70 bg-white/55 px-4 py-8 text-center">
                <p className={`${friendsHeadingFont.className} break-keep text-[18px] text-[#111827] sm:text-[20px] lg:text-[22px]`}>
                    아직 추천 결과가 없어요.
                </p>
                <p className={`${friendsDisplayFont.className} break-keep mt-2 text-[13px] leading-[1.6] text-[#6b7280] sm:text-[14px] lg:text-[15px]`}>
                    {meetingMode === "now"
                        ? "현재 상태 그대로 추천 버튼을 누르면 장소 3개와 지도 마커가 바로 표시돼요."
                        : "출발 위치를 정한 뒤 추천 버튼을 누르면 장소 3개와 지도 마커가 바로 표시돼요."}
                </p>
            </div>
        );
    }

    return (
        <ChatSectionCard className="px-4 py-5 sm:px-6 sm:py-6 lg:px-6 xl:px-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className={`${friendsDisplayFont.className} text-[14px] text-[#111827] sm:text-[16px]`}>
                        추천 결과
                    </p>
                    <div className="mt-2">
                        {hasRecommendations ? (
                            <>
                                <p className={`${friendsHeadingFont.className} text-[18px] text-[#111827] sm:text-[20px]`}>
                                    추천 결과를 한눈에 확인할 수 있어요.
                                </p>
                                <p className={`${friendsDisplayFont.className} mt-2 text-[13px] leading-[1.6] text-[#5f6782] sm:text-[14px]`}>
                                    선택한 조건을 기준으로 더미데이터 추천 결과를 별도 패널에 정리해 보여 줍니다.
                                </p>
                            </>
                        ) : (
                            <>
                                <p className={`${friendsHeadingFont.className} text-[18px] text-[#111827] sm:text-[20px]`}>
                                    추천 전에는 결과 패널이 비어 있어요.
                                </p>
                                <p className={`${friendsDisplayFont.className} mt-2 text-[13px] leading-[1.6] text-[#5f6782] sm:text-[14px]`}>
                                    조건을 정한 뒤 추천 받기를 누르면 장소 카드와 요약 정보가 이 영역에 채워집니다.
                                </p>
                            </>
                        )}
                    </div>
                </div>
                <span className={`${friendsBodyFont.className} w-fit rounded-full bg-[#f3eeff] px-3 py-1 text-[11px] text-[#6c5ce7] sm:text-[12px]`}>
                    {recommendationSummary.modeLabel}
                </span>
            </div>

            <div className="mt-4 rounded-[20px] border border-[#ddd8ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(241,237,255,0.92)_100%)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] sm:px-5 sm:py-5">
                {renderRecommendationResultArea()}
            </div>
        </ChatSectionCard>
    );
}