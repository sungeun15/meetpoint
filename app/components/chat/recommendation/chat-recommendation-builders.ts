import type { FriendItem } from "../../friends/types";

import {
    categoryLabelMap,
    MAX_RECOMMENDATION_COUNT,
    recommendationTemplates,
} from "./chat-recommendation-data";
import {
    buildFriendLocationDescription,
    buildMidpointDescription,
    buildMyLocationDescription,
    formatRecommendationScoreLabel,
    RECOMMENDATION_SCORING_LABEL,
} from "./chat-recommendation-copy";
import {
    calculateDistanceKm,
    calculateRecommendationScore,
} from "./chat-recommendation-utils";
import {
    formatDrivingEstimate,
    formatRecommendationDistance,
} from "./summary/chat-recommendation-summary";
import type {
    LocationPoint,
    MapMarker,
    RecommendationCard,
    RecommendationCategory,
    RecommendationSummary,
} from "../types";

type BuildRecommendationCardsArgs = {
    friend: FriendItem | null; // 선택된 친구 정보입니다. 이름이 없을 때 카드 id 기본값 계산에 사용됩니다.
    category: RecommendationCategory; // 현재 추천하려는 장소 카테고리입니다.
    myOrigin: LocationPoint; // 내 출발 좌표입니다.
    friendOrigin: LocationPoint; // 친구 출발 좌표입니다.
    midpoint: LocationPoint; // 두 사람 사이의 균형 중심 좌표입니다.
};

// 카테고리별 템플릿 후보를 점수화해 결과 카드 목록으로 변환합니다.
export function buildRecommendationCards({
    friend,
    category,
    myOrigin,
    friendOrigin,
    midpoint,
}: BuildRecommendationCardsArgs): RecommendationCard[] {
    const nickname = friend?.nickname ?? "친구";

    return recommendationTemplates[category]
        .map((template) => {
            // 템플릿 원본 좌표를 거리 계산 함수가 기대하는 공통 LocationPoint 형태로 맞춥니다.
            const candidatePoint = {
                latitude: template.latitude,
                longitude: template.longitude,
            } satisfies LocationPoint;
            const myDistance = calculateDistanceKm(myOrigin, candidatePoint);
            const friendDistance = calculateDistanceKm(friendOrigin, candidatePoint);
            const midpointDistance = calculateDistanceKm(midpoint, candidatePoint);
            // 점수는 중심점과의 거리, 두 사람 거리 균형을 함께 고려해 계산합니다.
            const score = calculateRecommendationScore({
                midpointDistanceKm: midpointDistance,
                myDistanceKm: myDistance,
                friendDistanceKm: friendDistance,
            });

            return {
                id: `${nickname}-${template.id}`,
                name: template.name,
                category: template.category,
                address: template.address,
                latitude: template.latitude,
                longitude: template.longitude,
                myDistance: formatRecommendationDistance(myDistance),
                friendDistance: formatRecommendationDistance(friendDistance),
                myDrivingEstimate: formatDrivingEstimate(myDistance),
                friendDrivingEstimate: formatDrivingEstimate(friendDistance),
                score,
            };
        })
        // 높은 점수 순으로 정렬한 뒤 상위 결과만 카드로 노출합니다.
        .sort((left, right) => right.score - left.score)
        .slice(0, MAX_RECOMMENDATION_COUNT)
        .map((recommendation, index) => ({
            id: recommendation.id,
            rank: index + 1,
            name: recommendation.name,
            category: recommendation.category,
            address: recommendation.address,
            latitude: recommendation.latitude,
            longitude: recommendation.longitude,
            myDistance: recommendation.myDistance,
            friendDistance: recommendation.friendDistance,
            myDrivingEstimate: recommendation.myDrivingEstimate,
            friendDrivingEstimate: recommendation.friendDrivingEstimate,
            scoreLabel: formatRecommendationScoreLabel(recommendation.score),
        }));
}

type BuildRecommendationSummaryArgs = {
    modeLabel: string; // 지금 만나기/나중에 만나기 같은 현재 추천 모드 라벨입니다.
    category: RecommendationCategory; // 추천 결과에 반영할 카테고리입니다.
    departureLabel: string; // 출발 조건 요약 라벨입니다.
    midpointLabel: string; // 계산된 중심점 요약 라벨입니다.
};

// 상단 요약 카드에서 사용하는 추천 메타 정보를 조합합니다.
export function buildRecommendationSummary({
    modeLabel,
    category,
    departureLabel,
    midpointLabel,
}: BuildRecommendationSummaryArgs): RecommendationSummary {
    return {
        modeLabel,
        categoryLabel: categoryLabelMap[category],
        departureLabel,
        midpointLabel,
        scoringLabel: RECOMMENDATION_SCORING_LABEL,
    };
}

type BuildMapMarkersArgs = {
    friendName: string; // 친구 위치 마커 라벨에 사용할 이름입니다.
    myLocation: { address: string; latitude: number; longitude: number; sharedAt?: string | null } | null; // 내 위치 마커 원본 데이터입니다.
    friendLocation: { address: string; latitude: number; longitude: number; sharedAt?: string | null } | null; // 친구 위치 마커 원본 데이터입니다.
    midpoint: LocationPoint | null; // 계산된 중심점 좌표입니다.
    recommendationCards?: RecommendationCard[]; // 장소 마커로 확장할 추천 카드 목록입니다.
};

// 사람 위치, 중심점, 추천 장소를 지도용 마커 배열로 펼칩니다.
export function buildMapMarkers({
    friendName,
    myLocation,
    friendLocation,
    midpoint,
    recommendationCards = [],
}: BuildMapMarkersArgs): MapMarker[] {
    const markers: MapMarker[] = [];

    // 사람 위치와 중심점 마커를 먼저 넣고, 이후 추천 장소 마커를 뒤에 붙입니다.
    if (myLocation) {
        markers.push({
            id: "me",
            label: "내 위치",
            description: buildMyLocationDescription(myLocation.address, myLocation.sharedAt),
            address: myLocation.address,
            latitude: myLocation.latitude,
            longitude: myLocation.longitude,
            markerType: "person",
        });
    }

    if (friendLocation) {
        markers.push({
            id: "friend",
            label: `${friendName} 위치`,
            description: buildFriendLocationDescription(friendLocation.address, friendLocation.sharedAt),
            address: friendLocation.address,
            latitude: friendLocation.latitude,
            longitude: friendLocation.longitude,
            markerType: "person",
        });
    }

    if (midpoint) {
        markers.push({
            id: "midpoint",
            label: "중심점",
            description: buildMidpointDescription(midpoint),
            latitude: midpoint.latitude,
            longitude: midpoint.longitude,
            markerType: "midpoint",
        });
    }

    recommendationCards.forEach((recommendationCard) => {
        markers.push({
            id: recommendationCard.id,
            label: recommendationCard.name,
            description: `${recommendationCard.category} · ${recommendationCard.scoreLabel}`,
            address: recommendationCard.address,
            placeCategory: recommendationCard.category,
            rank: recommendationCard.rank,
            latitude: recommendationCard.latitude,
            longitude: recommendationCard.longitude,
            markerType: "place",
        });
    });

    return markers;
}