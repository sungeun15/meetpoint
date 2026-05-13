import { friendsBodyFont, friendsHeadingFont } from "../../../friends/fonts";
import { RecommendationCardDetailTabs } from "./chat-recommendation-card-detail-tabs";
import { buildRecommendationCardHeaderContent } from "./chat-recommendation-card-item-presenter";
import { useRecommendationCardItemController } from "./use-recommendation-card-item-controller";
import type { RecommendationCard } from "../../types";

type RecommendationCardItemProps = {
    recommendationCard: RecommendationCard; // 장소 이름, 거리, 주소 등 카드 한 장을 그리는 데 필요한 추천 데이터입니다.
    isSelected: boolean; // 현재 카드가 선택 상태인지 나타냅니다.
    isHiddenOnMobile: boolean; // 모바일 접힘 상태에서 이 카드를 숨겨야 하는지 나타냅니다.
    onSelect: (recommendationId: string) => void; // 카드 선택 이벤트를 상위 상태로 전달합니다.
    registerElement: (element: HTMLDivElement | null) => void; // 선택 카드 자동 스크롤을 위해 카드 DOM을 등록합니다.
};

// 추천 장소 카드 한 장의 헤더와 상세 탭을 렌더합니다.
export function RecommendationCardItem({
    recommendationCard,
    isSelected,
    isHiddenOnMobile,
    onSelect,
    registerElement,
}: RecommendationCardItemProps) {
    const headerContent = buildRecommendationCardHeaderContent(recommendationCard, isSelected);
    const { handleSelect, handleKeyDown } = useRecommendationCardItemController({
        recommendationId: recommendationCard.id,
        onSelect,
    });

    return (
        <article
            className={`relative overflow-hidden rounded-[18px] border px-2 py-2 transition duration-200 ${isHiddenOnMobile ? "hidden sm:block" : "block"} sm:px-3.5 sm:py-3.5 ${isSelected
                ? "border-[#7c6ae6]/55 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.98)_0%,rgba(239,232,255,0.98)_38%,rgba(228,241,255,0.96)_100%)] shadow-[0px_18px_42px_rgba(86,60,201,0.26)]"
                : "border-white/70 bg-white/90 shadow-[0px_12px_30px_rgba(52,41,104,0.1)] hover:border-[#d9d4ff] hover:bg-white"}`}
        >
            {/* 선택된 카드에는 상단 그라데이션 바를 추가해 지도/리스트 동기화 상태를 더 분명히 보여 줍니다. */}
            {isSelected ? (
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#6d4ddb_0%,#54a6ff_100%)]" />
            ) : null}
            <div
                ref={registerElement}
                role="button"
                tabIndex={0}
                onClick={handleSelect}
                onKeyDown={handleKeyDown}
                className="block w-full text-left"
            >
                {/* 카드 본문 전체를 버튼처럼 동작시켜 클릭과 키보드 선택을 같은 흐름으로 처리합니다. */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className={`${friendsHeadingFont.className} break-keep text-[14px] text-[#111827] sm:text-[18px] xl:text-[22px]`}>
                            {headerContent.title}
                        </p>
                        <p className={`${friendsBodyFont.className} mt-0.5 text-[9px] text-[#6c5ce7] sm:mt-1 sm:text-[12px] xl:text-[14px]`}>
                            {headerContent.category}
                        </p>
                    </div>
                    <div className={`${friendsBodyFont.className} w-fit rounded-full bg-[#f3eeff] px-2 py-0.5 text-[8px] text-[#5f47d2] sm:hidden`}>
                        {headerContent.mobileMetaLabel}
                    </div>
                    {/* 데스크톱에서는 거리와 점수를 개별 배지로 분리해 한눈에 비교하기 쉽게 보여 줍니다. */}
                    <div className="hidden flex-wrap gap-1.5 sm:flex sm:gap-2 sm:justify-end">
                        {headerContent.desktopBadges.map((badge) => (
                            <div key={badge.id} className={`${friendsBodyFont.className} w-fit rounded-full px-2 py-1 text-[9px] sm:px-3 sm:text-[12px] ${badge.className}`}>
                                {badge.label}
                            </div>
                        ))}
                    </div>
                </div>
                <RecommendationCardDetailTabs recommendationCard={recommendationCard} isSelected={isSelected} />
            </div>
        </article>
    );
}