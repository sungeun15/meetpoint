import { friendsBodyFont, friendsDisplayFont } from "../../../friends/fonts";
import {
    buildRecommendationCardDetailSections,
} from "./chat-recommendation-card-detail-presenter";
import { useRecommendationCardDetailTabsController } from "./use-recommendation-card-detail-tabs-controller";
import type { RecommendationCard } from "../../types";

type RecommendationCardDetailTabsProps = {
    recommendationCard: RecommendationCard; // 주소, 거리, 운전 추정 시간 등 상세 탭에서 읽을 카드 데이터입니다.
    isSelected: boolean; // 선택 카드 여부에 따라 상세 박스 톤을 조정합니다.
};

// 추천 카드 하단의 상세 정보 탭과 내용을 모바일/데스크톱에 맞춰 렌더합니다.
export function RecommendationCardDetailTabs({ recommendationCard, isSelected }: RecommendationCardDetailTabsProps) {
    const detailSections = buildRecommendationCardDetailSections(recommendationCard, isSelected);
    const {
        activeMobileDetailTab,
        activeMobileContent,
        selectMobileDetailTab,
    } = useRecommendationCardDetailTabsController({ detailSections });

    return (
        <>
            {/* 모바일에서는 탭 버튼으로 한 번에 한 섹션만 보여 줘 카드 높이를 줄입니다. */}
            <div className="mt-1.5 flex flex-wrap gap-1 sm:hidden">
                {detailSections.map((section) => (
                    <button
                        key={section.id}
                        type="button"
                        onClick={(event) => {
                            // 카드 선택 클릭과 탭 전환 클릭이 충돌하지 않도록 이벤트 전파를 막습니다.
                            event.stopPropagation();
                            selectMobileDetailTab(section.id);
                        }}
                        className={`${friendsBodyFont.className} rounded-full px-2 py-0.5 text-[9px] ${activeMobileDetailTab === section.id ? "bg-[#2b2373] text-white" : "bg-[#f3eeff] text-[#6c5ce7]"}`}
                    >
                        {section.tabLabel}
                    </button>
                ))}
            </div>

            {/* 현재 선택된 모바일 탭 한 개만 본문으로 노출합니다. */}
            <div className={`mt-1.5 min-w-0 rounded-[14px] px-2 py-1.5 sm:hidden ${activeMobileContent.toneClassName}`}>
                <p className={`${friendsBodyFont.className} text-[10px] uppercase tracking-[0.16em] ${activeMobileContent.accentClassName}`}>
                    {activeMobileContent.label}
                </p>
                <p className={`${friendsDisplayFont.className} mt-1 break-keep text-[10px] leading-[1.4] ${activeMobileContent.textClassName}`}>
                    {activeMobileContent.value}
                </p>
            </div>

            {/* 데스크톱에서는 상세 섹션을 동시에 배치해 카드 비교를 빠르게 할 수 있게 합니다. */}
            <div className="mt-2 hidden gap-1.5 sm:mt-2.5 sm:grid sm:gap-2 sm:grid-cols-2">
                {detailSections.map((section) => (
                    <div key={section.id} className={`rounded-[14px] px-2.5 py-2 ${section.desktopSpanClassName ?? ""} ${section.toneClassName}`}>
                        <p className={`${friendsBodyFont.className} text-[10px] uppercase tracking-[0.16em] ${section.accentClassName}`}>
                            {section.label}
                        </p>
                        <p className={`${friendsDisplayFont.className} mt-1 break-keep text-[11px] leading-[1.45] ${section.textClassName} sm:mt-1.5 sm:text-[13px] xl:text-[14px]`}>
                            {section.value}
                        </p>
                    </div>
                ))}
            </div>
        </>
    );
}