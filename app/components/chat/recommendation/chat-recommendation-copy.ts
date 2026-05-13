import type { LocationPoint, MeetingMode } from "../types";

import { formatLocationPreview } from "./summary/chat-recommendation-summary";

// 추천 카드/지도/목록 전반에서 공통으로 쓰는 점수 설명 문구입니다.
export const RECOMMENDATION_SCORING_LABEL = "평균 이동거리, 거리 편차, 카테고리 적합도, 지역 활성도를 함께 고려";

// 숫자 점수를 사용자 노출용 라벨로 포맷합니다.
export function formatRecommendationScoreLabel(score: number) {
    return `균형 점수 ${score}점`;
}

// 내 위치 마커 설명 문구를 만듭니다.
export function buildMyLocationDescription(address: string, sharedAt?: string | null) {
    return `${address}${sharedAt ? ` · 마지막 공유 ${sharedAt}` : ""}`;
}

// 친구 위치 마커 설명 문구를 만듭니다.
export function buildFriendLocationDescription(address: string, sharedAt?: string | null) {
    return `${address}${sharedAt ? ` · 마지막 확인 ${sharedAt}` : ""}`;
}

// 중심점 마커의 설명 문구를 만듭니다.
export function buildMidpointDescription(midpoint: LocationPoint) {
    return `두 사람의 이동 균형 기준 · ${formatLocationPreview(midpoint)}`;
}

// 추천 조건 패널 상단의 가이드 문구입니다.
export function buildDepartureSettingsGuideCopy() {
    return "만남 모드, 출발 위치, 카테고리를 고른 뒤 추천 버튼을 누르면 결과 카드와 지도가 바로 바뀝니다.";
}

// 결과 패널 섹션 라벨입니다.
export function buildRecommendationResultsSectionLabel() {
    return "추천 결과";
}

// 결과가 준비된 상태의 제목입니다.
export function buildRecommendationResultsReadyTitle() {
    return "추천 결과를 한눈에 확인할 수 있어요.";
}

// 추천 전 비어 있는 상태의 제목입니다.
export function buildRecommendationResultsPendingTitle() {
    return "추천 전에는 결과 패널이 비어 있어요.";
}

// 결과가 아직 없을 때의 제목입니다.
export function buildRecommendationResultsEmptyTitle() {
    return "아직 추천 결과가 없어요.";
}

// 지도 패널 섹션 라벨입니다.
export function buildRecommendationMapSectionLabel() {
    return "추천 장소 지도";
}

// 지도에 추천 마커가 반영된 뒤의 제목입니다.
export function buildRecommendationMapReadyTitle() {
    return "추천 결과에 맞춰 지도 마커를 표시해요.";
}

// 추천 전 기본 지도 상태의 제목입니다.
export function buildRecommendationMapPendingTitle() {
    return "추천 전에도 기본 지도를 먼저 보여 줍니다.";
}

// 모바일에서 장소 칩 접기/펼치기 버튼 라벨을 계산합니다.
export function buildRecommendationMapPlaceChipToggleLabel(isExpanded: boolean, visibleCount: number) {
    return isExpanded ? "장소 칩 접기" : `장소 칩 ${visibleCount}개만 먼저 보기`;
}

// 추천 완료 후 지도 패널 설명 문구입니다.
export function buildRecommendationMapReadyCopy(maxRecommendationCount: number) {
    return `추천 버튼을 누르면 중심점과 장소 최대 ${maxRecommendationCount}개가 지도와 결과 카드에 함께 반영됩니다.`;
}

// 추천 전 지도 패널 설명 문구입니다.
export function buildRecommendationMapPendingCopy(maxRecommendationCount: number) {
    return `내 위치를 공유하면 친구 위치와 중심점을 먼저 표시하고, 추천 후에는 장소 마커를 최대 ${maxRecommendationCount}개까지 더 올려 줍니다.`;
}

// 추천 결과가 비어 있을 때 모드에 맞는 안내 문구를 반환합니다.
export function buildRecommendationResultsEmptyCopy(meetingMode: MeetingMode, maxRecommendationCount: number) {
    return meetingMode === "now"
        ? `현재 상태 그대로 추천 버튼을 누르면 장소 최대 ${maxRecommendationCount}개와 지도 마커가 바로 표시돼요.`
        : `출발 위치를 정한 뒤 추천 버튼을 누르면 장소 최대 ${maxRecommendationCount}개와 지도 마커가 바로 표시돼요.`;
}

// 추천 완료 후 결과 패널 설명 문구입니다.
export function buildRecommendationResultsReadyCopy(maxRecommendationCount: number) {
    return `선택한 조건을 기준으로 최대 ${maxRecommendationCount}개까지 정렬하고, 카드에는 주소와 직선 거리, 자동차 기준 추정 시간을 함께 보여 줍니다.`;
}

// 추천 전 결과 패널 설명 문구입니다.
export function buildRecommendationResultsPendingCopy() {
    return "조건을 정한 뒤 추천 받기를 누르면 장소 카드와 요약 정보가 이 영역에 채워집니다.";
}

// 목록 상단 요약 영역에서 보여 주는 안내 문구입니다.
export function buildRecommendationListSummaryCopy(maxRecommendationCount: number) {
    return `최대 ${maxRecommendationCount}개 결과를 정렬하고, 화면에는 4개 높이까지 먼저 보여 줍니다.`;
}

// 현재 추천 카드 수를 배지 문구로 바꿉니다.
export function buildRecommendationListCountBadgeCopy(recommendationCount: number) {
    return `현재 ${recommendationCount}개 표시 준비`;
}

// 모바일 추천 목록 접기/펼치기 버튼 라벨을 계산합니다.
export function buildRecommendationListToggleLabel(isExpanded: boolean, visibleCount: number) {
    return isExpanded ? "추천 목록 접기" : `추천 ${visibleCount}개만 먼저 보기`;
}