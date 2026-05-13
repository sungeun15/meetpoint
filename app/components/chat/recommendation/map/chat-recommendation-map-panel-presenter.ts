import {
    buildRecommendationMapPendingCopy,
    buildRecommendationMapPendingTitle,
    buildRecommendationMapReadyCopy,
    buildRecommendationMapReadyTitle,
    buildRecommendationMapSectionLabel,
} from "../chat-recommendation-copy";
import { MAX_RECOMMENDATION_COUNT } from "../chat-recommendation-data";

type BuildRecommendationMapPanelPresenterArgs = {
    hasRecommendations: boolean; // 추천 결과가 실제로 생성된 상태인지 나타냅니다.
    participantMarkerCount: number; // 추천 전에도 보여 줄 수 있는 사람/중심점 마커 개수입니다.
};

// 지도 패널의 헤더 문구와 칩 렌더링 분기를 현재 상태에 맞게 계산합니다.
export function buildRecommendationMapPanelPresenter({
    hasRecommendations,
    participantMarkerCount,
}: BuildRecommendationMapPanelPresenterArgs) {
    // 추천이 끝난 뒤에는 장소 칩 목록을 보여 주고, 추천 전에는 참여자 마커 칩만 제한적으로 보여 줍니다.
    if (hasRecommendations) {
        return {
            sectionLabel: buildRecommendationMapSectionLabel(),
            title: buildRecommendationMapReadyTitle(),
            copy: buildRecommendationMapReadyCopy(MAX_RECOMMENDATION_COUNT),
            shouldRenderRecommendationChipList: true,
            shouldRenderParticipantMarkerChips: false,
        };
    }

    return {
        sectionLabel: buildRecommendationMapSectionLabel(),
        title: buildRecommendationMapPendingTitle(),
        copy: buildRecommendationMapPendingCopy(MAX_RECOMMENDATION_COUNT),
        shouldRenderRecommendationChipList: false,
        shouldRenderParticipantMarkerChips: participantMarkerCount > 0,
    };
}