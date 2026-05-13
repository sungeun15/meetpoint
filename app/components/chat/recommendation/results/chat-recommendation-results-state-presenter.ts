import {
    buildRecommendationResultsEmptyCopy,
    buildRecommendationResultsEmptyTitle,
    buildRecommendationResultsPendingCopy,
    buildRecommendationResultsPendingTitle,
    buildRecommendationResultsReadyCopy,
    buildRecommendationResultsReadyTitle,
} from "../chat-recommendation-copy";
import { MAX_RECOMMENDATION_COUNT } from "../chat-recommendation-data";
import type { MeetingMode } from "../../types";

// 추천 결과 도착 전/후에 따라 인트로 영역에서 보여 줄 제목과 설명을 고릅니다.
export function buildRecommendationResultsIntroPresenter(hasRecommendations: boolean) {
    if (hasRecommendations) {
        return {
            title: buildRecommendationResultsReadyTitle(),
            copy: buildRecommendationResultsReadyCopy(MAX_RECOMMENDATION_COUNT),
        };
    }

    return {
        title: buildRecommendationResultsPendingTitle(),
        copy: buildRecommendationResultsPendingCopy(),
    };
}

// 추천이 비어 있을 때 현재 모임 방식에 맞는 안내 문구를 구성합니다.
export function buildRecommendationResultsEmptyPresenter(meetingMode: MeetingMode) {
    return {
        title: buildRecommendationResultsEmptyTitle(),
        copy: buildRecommendationResultsEmptyCopy(meetingMode, MAX_RECOMMENDATION_COUNT),
    };
}