// 초기 대화 메시지는 recommendation 모듈에서도 공통으로 재사용합니다.
export { initialChatMessages } from "../chat-message-seed";

// 추천 계산에 필요한 카탈로그 상수와 템플릿 타입을 한 곳에서 다시 노출합니다.
export {
    categoryLabelMap,
    defaultMapCenter,
    MAX_RECOMMENDATION_COUNT,
    recommendationTemplates,
    type RecommendationTemplate,
} from "./chat-recommendation-catalog";