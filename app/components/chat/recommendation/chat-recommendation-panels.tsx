import type { ChatRecommendationPanelsProps } from "./chat-recommendation-flow-helpers";
import {
    RecommendationPanelsGrid,
} from "./chat-recommendation-panels-sections";
import { useChatRecommendationPanelsComposition } from "./use-chat-recommendation-panels-composition";

// 추천 조건 패널, 결과 카드 패널, 지도 패널을 한 레이아웃에서 묶고 선택 상태를 동기화합니다.
export function ChatRecommendationPanels(props: ChatRecommendationPanelsProps) {
    const compositionSections = useChatRecommendationPanelsComposition(props);

    return <RecommendationPanelsGrid {...compositionSections} />;
}
