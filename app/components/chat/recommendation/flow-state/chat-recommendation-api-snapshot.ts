import { resolveCoordinateDisplayAddress } from "../../chat-coordinate-address-helpers";
import {
    buildMapMarkers,
    buildRecommendationSummary,
} from "../../data";
import {
    buildDepartureSummaryText,
    buildMidpointSummaryText,
    formatDrivingEstimate,
    formatDepartureSummaryLabel,
    formatRecommendationDistance,
    getMeetingModeLabel,
} from "../summary/chat-recommendation-summary";
import type {
    DepartureParty,
    MeetingMode,
    RecommendationCategory,
    RecommendationSnapshot,
    ResolvedLocation,
} from "../../types";

type RecommendationApiPlace = {
    name: string; // 추천 장소 이름입니다.
    category: string; // 서버가 계산한 장소 카테고리 라벨입니다.
    lat: number; // 추천 장소 위도입니다.
    lng: number; // 추천 장소 경도입니다.
    distanceA: number; // 내 출발지에서 장소까지의 거리(m)입니다.
    distanceB: number; // 친구 출발지에서 장소까지의 거리(m)입니다.
    averageDistance: number; // 양쪽 거리 평균값입니다.
    distanceGap: number; // 두 사람 거리 차이입니다.
    categoryPenalty: number; // 카테고리 적합도 보정 점수입니다.
    vitalityPenalty: number; // 상권/활성도 보정 점수입니다.
    score: number; // 최종 추천 정렬에 사용하는 점수입니다.
};

export type RecommendationApiResponse = {
    midpoint: {
        lat: number; // 서버가 계산한 중간지점 위도입니다.
        lng: number; // 서버가 계산한 중간지점 경도입니다.
    };
    summary: {
        mode: MeetingMode; // 추천 계산에 사용한 만남 기준입니다.
        category: RecommendationCategory; // 추천 계산에 사용한 카테고리입니다.
        radiusUsed: number; // 탐색 반경(m)입니다.
    };
    places: RecommendationApiPlace[]; // 서버가 반환한 추천 장소 목록입니다.
};

type BuildRecommendationSnapshotFromApiArgs = {
    response: RecommendationApiResponse; // 서버 응답 원본입니다.
    meetingMode: MeetingMode; // 현재 추천 모드입니다.
    selectedCategory: RecommendationCategory; // 현재 선택된 추천 카테고리입니다.
    friendName: string; // 요약 문구와 marker 라벨에 넣을 친구 이름입니다.
    myOrigin: ResolvedLocation; // 내 기준 출발 위치입니다.
    friendOrigin: ResolvedLocation; // 친구 기준 출발 위치입니다.
    selectedDepartureLabels: Record<DepartureParty, string | null> | null; // later 모드에서 직접 선택한 출발지 라벨입니다.
};

function formatRecommendationScoreLabel(score: number) {
    return `추천 점수 ${score}점`;
}

function metersToKilometers(distanceMeters: number) {
    return distanceMeters / 1000;
}

export async function buildRecommendationSnapshotFromApi({
    response,
    meetingMode,
    selectedCategory,
    friendName,
    myOrigin,
    friendOrigin,
    selectedDepartureLabels,
}: BuildRecommendationSnapshotFromApiArgs): Promise<RecommendationSnapshot> {
    const midpoint = {
        latitude: response.midpoint.lat,
        longitude: response.midpoint.lng,
    };
    // API 응답의 거리 단위(m)를 기존 카드 UI가 기대하는 km 문자열 형식으로 맞춥니다.
    const cards = await Promise.all(response.places.map(async (place, index) => {
        const resolvedAddress = await resolveCoordinateDisplayAddress({
            latitude: place.lat,
            longitude: place.lng,
        });

        return {
            id: `${friendName}-${place.name}-${index + 1}`,
            rank: index + 1,
            name: place.name,
            category: place.category,
            address: resolvedAddress,
            myDistance: formatRecommendationDistance(metersToKilometers(place.distanceA)),
            friendDistance: formatRecommendationDistance(metersToKilometers(place.distanceB)),
            myDrivingEstimate: formatDrivingEstimate(metersToKilometers(place.distanceA)),
            friendDrivingEstimate: formatDrivingEstimate(metersToKilometers(place.distanceB)),
            latitude: place.lat,
            longitude: place.lng,
            scoreLabel: formatRecommendationScoreLabel(place.score),
        };
    }));
    // now/later 모드에 따라 요약문에 노출할 출발지 기준 문구를 달리 구성합니다.
    const summary = buildRecommendationSummary({
        modeLabel: getMeetingModeLabel(meetingMode),
        category: selectedCategory,
        departureLabel: meetingMode === "now"
            ? buildDepartureSummaryText(
                "현재 공유 위치 기준",
                formatDepartureSummaryLabel(myOrigin.address, "현재 위치"),
                friendName,
                formatDepartureSummaryLabel(friendOrigin.address, `${friendName} 위치`),
            )
            : buildDepartureSummaryText(
                "출발 위치 기준",
                formatDepartureSummaryLabel(selectedDepartureLabels?.me ?? myOrigin.address, "선택 필요"),
                friendName,
                formatDepartureSummaryLabel(selectedDepartureLabels?.friend ?? friendOrigin.address, `${friendName} 위치`),
            ),
        midpointLabel: `${buildMidpointSummaryText(response.midpoint.lat, response.midpoint.lng)}\n반경: ${response.summary.radiusUsed}m`,
    });
    // later 모드에서는 sharedAt 의미가 없으므로 marker 생성 전에 null 로 정리합니다.
    const markers = buildMapMarkers({
        friendName,
        myLocation: meetingMode === "now" ? myOrigin : { ...myOrigin, sharedAt: null },
        friendLocation: meetingMode === "now" ? friendOrigin : { ...friendOrigin, sharedAt: null },
        midpoint,
        recommendationCards: cards,
    });

    return {
        summary,
        cards,
        markers,
    };
}