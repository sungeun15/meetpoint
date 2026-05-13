import { useState } from "react";

import type {
    RecommendationCardDetailSection,
    RecommendationCardDetailTabId,
} from "./chat-recommendation-card-detail-presenter";

const DEFAULT_ACTIVE_MOBILE_DETAIL_TAB: RecommendationCardDetailTabId = "address";

type UseRecommendationCardDetailTabsControllerArgs = {
    detailSections: RecommendationCardDetailSection[]; // 현재 카드에서 사용할 상세 섹션 배열입니다.
};

// 모바일 상세 탭의 현재 선택 섹션을 관리하는 훅입니다.
export function useRecommendationCardDetailTabsController({
    detailSections,
}: UseRecommendationCardDetailTabsControllerArgs) {
    const [activeMobileDetailTab, setActiveMobileDetailTab] = useState<RecommendationCardDetailTabId>(DEFAULT_ACTIVE_MOBILE_DETAIL_TAB);
    // 현재 활성 탭에 해당하는 섹션을 찾고, 없으면 첫 섹션으로 안전하게 대체합니다.
    const activeMobileContent = detailSections.find((section) => section.id === activeMobileDetailTab) ?? detailSections[0];

    // 모바일 탭 버튼 클릭 시 활성 섹션 id를 갱신합니다.
    function selectMobileDetailTab(tabId: RecommendationCardDetailTabId) {
        setActiveMobileDetailTab(tabId);
    }

    return {
        activeMobileDetailTab,
        activeMobileContent,
        selectMobileDetailTab,
    };
}