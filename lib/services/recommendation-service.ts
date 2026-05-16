import { recommendationPlaceFixtures } from "@/fixtures/places";
import { MAX_RECOMMENDATION_COUNT } from "@/lib/constants/recommendation";
import {
    fetchPlaceCandidatesByRadius,
    KakaoLocalApiError,
    type KakaoPlaceCandidate,
} from "@/lib/kakao/local";
import { calculateMidpoint, haversineDistance, type CoordinatePoint } from "@/lib/utils/distance";

export type RecommendationMode = "now" | "later";
export type RecommendationCategory = "cafe" | "meal" | "fun";

export type RecommendationPlace = {
    name: string;
    category: string;
    lat: number;
    lng: number;
    distanceA: number;
    distanceB: number;
    averageDistance: number;
    distanceGap: number;
    categoryPenalty: number;
    vitalityPenalty: number;
    score: number;
};

export class LocationRequiredError extends Error {
    constructor() {
        super("지금 만나기 모드에서는 두 사람의 현재 위치가 모두 필요합니다.");
        this.name = "LocationRequiredError";
    }
}

export class DepartureRequiredError extends Error {
    constructor() {
        super("나중에 만나기 모드에서는 두 사람의 출발 위치가 모두 필요합니다.");
        this.name = "DepartureRequiredError";
    }
}

function classifyPlaceCategory(placeCategory: string) {
    const normalizedCategory = placeCategory.toLowerCase();

    if (/(베이커리|디저트)/.test(placeCategory)) {
        return "dessert";
    }

    if (/(카페|coffee)/.test(normalizedCategory)) {
        return "cafe";
    }

    if (/(한식|중식|일식|양식|식당|음식점|분식|치킨|피자|햄버거|국수|비스트로|다이닝)/.test(placeCategory)) {
        return "meal";
    }

    if (/(영화|노래|게임|문화|볼링|보드게임|방탈출|오락|vr|전시|공연|놀거리)/i.test(placeCategory)) {
        return "fun";
    }

    return "other";
}

export function computeCategoryPenalty(requestedCategory: RecommendationCategory, placeCategory: string) {
    const classifiedCategory = classifyPlaceCategory(placeCategory);

    if (requestedCategory === "cafe") {
        if (classifiedCategory === "cafe") {
            return 0;
        }

        if (classifiedCategory === "dessert") {
            return 200;
        }

        if (classifiedCategory === "meal") {
            return 800;
        }

        return 1000;
    }

    if (requestedCategory === "meal") {
        if (classifiedCategory === "meal") {
            return 0;
        }

        if (classifiedCategory === "cafe" || classifiedCategory === "dessert") {
            return 600;
        }

        return 1000;
    }

    if (classifiedCategory === "fun") {
        return 0;
    }

    if (classifiedCategory === "cafe" || classifiedCategory === "dessert") {
        return 400;
    }

    return 1000;
}

export function computeVitalityPenalty(place: KakaoPlaceCandidate, candidates: KakaoPlaceCandidate[]) {
    const nearbyCount = candidates.filter((candidate) => {
        if (candidate.name === place.name && candidate.lat === place.lat && candidate.lng === place.lng) {
            return false;
        }

        return haversineDistance(
            { lat: place.lat, lng: place.lng },
            { lat: candidate.lat, lng: candidate.lng },
        ) <= 500;
    }).length;

    if (nearbyCount >= 10) {
        return 0;
    }

    if (nearbyCount >= 6) {
        return 200;
    }

    if (nearbyCount >= 3) {
        return 500;
    }

    if (nearbyCount >= 1) {
        return 800;
    }

    return 1200;
}

export function scorePlaceCandidate(input: {
    place: KakaoPlaceCandidate;
    userLocation: CoordinatePoint;
    friendLocation: CoordinatePoint;
    requestedCategory: RecommendationCategory;
    candidates: KakaoPlaceCandidate[];
}) {
    const distanceA = Math.round(haversineDistance(input.userLocation, input.place));
    const distanceB = Math.round(haversineDistance(input.friendLocation, input.place));
    const averageDistance = Math.round((distanceA + distanceB) / 2);
    const distanceGap = Math.abs(distanceA - distanceB);
    const categoryPenalty = computeCategoryPenalty(input.requestedCategory, input.place.category);
    const vitalityPenalty = computeVitalityPenalty(input.place, input.candidates);

    return {
        name: input.place.name,
        category: input.place.category,
        lat: input.place.lat,
        lng: input.place.lng,
        distanceA,
        distanceB,
        averageDistance,
        distanceGap,
        categoryPenalty,
        vitalityPenalty,
        score: averageDistance + distanceGap + categoryPenalty + vitalityPenalty,
    } satisfies RecommendationPlace;
}

export function sortRecommendations(places: RecommendationPlace[]) {
    return [...places].sort((left, right) => {
        if (left.score !== right.score) {
            return left.score - right.score;
        }

        if (left.distanceGap !== right.distanceGap) {
            return left.distanceGap - right.distanceGap;
        }

        if (left.averageDistance !== right.averageDistance) {
            return left.averageDistance - right.averageDistance;
        }

        return left.name.localeCompare(right.name, "ko");
    });
}

function isRecommendationFixtureFallbackEnabled() {
    return process.env.NODE_ENV !== "production";
}

// fallback fixture 는 중심점과 가까운 후보만 남겨 개발 환경에서도 반경 확장 흐름을 비슷하게 재현한다.
function resolveFixtureCandidatesByRadius(
    midpoint: CoordinatePoint,
    category: RecommendationCategory,
    radius: number,
    size: number,
) {
    return recommendationPlaceFixtures[category]
        .filter((place) => haversineDistance(midpoint, place) <= radius)
        .sort(
            (left, right) =>
                haversineDistance(midpoint, left) - haversineDistance(midpoint, right),
        )
        .slice(0, size);
}

export async function resolveCandidateRadius(midpoint: CoordinatePoint, category: RecommendationCategory) {
    let kakaoError: KakaoLocalApiError | null = null;

    for (const radius of [1000, 2000, 3000]) {
        try {
            const candidates = await fetchPlaceCandidatesByRadius({ midpoint, category, radius, size: 15 });

            if (candidates.length > 0) {
                return {
                    radiusUsed: radius,
                    candidates,
                };
            }
        } catch (error) {
            if (!(error instanceof KakaoLocalApiError)) {
                throw error;
            }

            kakaoError = error;
        }

        if (isRecommendationFixtureFallbackEnabled()) {
            const fixtureCandidates = resolveFixtureCandidatesByRadius(midpoint, category, radius, 15);

            if (fixtureCandidates.length > 0) {
                return {
                    radiusUsed: radius,
                    candidates: fixtureCandidates,
                };
            }
        }
    }

    if (kakaoError && !isRecommendationFixtureFallbackEnabled()) {
        throw kakaoError;
    }

    return {
        radiusUsed: 3000,
        candidates: [] as KakaoPlaceCandidate[],
    };
}

export async function getRecommendations(input: {
    mode: RecommendationMode;
    category: RecommendationCategory;
    currentUserLocation: CoordinatePoint | null;
    friendLocation: CoordinatePoint | null;
    departure: CoordinatePoint | null;
    friendDeparture: CoordinatePoint | null;
}) {
    const userLocation = input.mode === "now" ? input.currentUserLocation : input.departure;
    const targetFriendLocation = input.mode === "now" ? input.friendLocation : input.friendDeparture;

    if (input.mode === "now" && (!userLocation || !targetFriendLocation)) {
        throw new LocationRequiredError();
    }

    if (input.mode === "later" && (!userLocation || !targetFriendLocation)) {
        throw new DepartureRequiredError();
    }

    const midpoint = calculateMidpoint(userLocation as CoordinatePoint, targetFriendLocation as CoordinatePoint);
    const { radiusUsed, candidates } = await resolveCandidateRadius(midpoint, input.category);

    if (!candidates.length) {
        return {
            midpoint,
            summary: {
                mode: input.mode,
                category: input.category,
                radiusUsed,
            },
            places: [] as RecommendationPlace[],
        };
    }

    const places = sortRecommendations(
        candidates.map((place) =>
            scorePlaceCandidate({
                place,
                userLocation: userLocation as CoordinatePoint,
                friendLocation: targetFriendLocation as CoordinatePoint,
                requestedCategory: input.category,
                candidates,
            }),
        ),
    ).slice(0, MAX_RECOMMENDATION_COUNT);

    return {
        midpoint,
        summary: {
            mode: input.mode,
            category: input.category,
            radiusUsed,
        },
        places,
    };
}