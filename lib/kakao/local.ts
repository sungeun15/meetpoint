type KakaoKeywordSearchDocument = {
    id: string;
    place_name: string;
    category_name: string;
    category_group_code: string;
    address_name: string;
    road_address_name: string;
    x: string;
    y: string;
};

type KakaoKeywordSearchResponse = {
    documents: KakaoKeywordSearchDocument[];
};

type KakaoCategorySearchResponse = {
    documents: KakaoKeywordSearchDocument[];
};

const CATEGORY_GROUP_CODE_MAP = {
    cafe: "CE7",
    meal: "FD6",
} as const;

const FUN_KEYWORD_QUERIES = ["영화관", "노래방", "보드게임", "볼링장", "방탈출", "문화시설"] as const;

export type DepartureSearchItem = {
    label: string;
    source: "search";
    lat: number;
    lng: number;
};

export type KakaoPlaceCandidate = {
    name: string;
    category: string;
    lat: number;
    lng: number;
    address: string;
    categoryGroupCode: string;
};

export class KakaoLocalApiError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "KakaoLocalApiError";
    }
}

function normalizeKakaoPlace(document: KakaoKeywordSearchDocument): KakaoPlaceCandidate | null {
    const lat = Number(document.y);
    const lng = Number(document.x);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
    }

    return {
        name: document.place_name,
        category: document.category_name,
        lat,
        lng,
        address: document.road_address_name || document.address_name,
        categoryGroupCode: document.category_group_code,
    };
}

function getKakaoLocalRestApiKey() {
    const restApiKey = process.env.KAKAO_LOCAL_REST_API_KEY;

    if (!restApiKey) {
        throw new KakaoLocalApiError("KAKAO_LOCAL_REST_API_KEY가 설정되지 않았습니다.");
    }

    return restApiKey;
}

async function requestKakaoLocal<T>(url: URL) {
    const response = await fetch(url, {
        headers: {
            Authorization: `KakaoAK ${getKakaoLocalRestApiKey()}`,
        },
        cache: "no-store",
    });
    const body = await response.text();

    if (!response.ok) {
        throw new KakaoLocalApiError(
            `Kakao Local API 요청이 실패했습니다: ${response.status} ${response.statusText}`,
        );
    }

    try {
        return JSON.parse(body) as T;
    } catch {
        throw new KakaoLocalApiError("Kakao Local API 응답을 해석할 수 없습니다.");
    }
}

// 키워드 검색은 출발 위치 검색 API와 later 모드 입력 보조에 공통으로 사용한다.
export async function searchPlacesByKeyword(
    query: string,
    size = 10,
    location?: { lat: number; lng: number; radius: number },
) {
    const url = new URL("https://dapi.kakao.com/v2/local/search/keyword.json");

    url.searchParams.set("query", query);
    url.searchParams.set("size", String(size));

    if (location) {
        url.searchParams.set("y", String(location.lat));
        url.searchParams.set("x", String(location.lng));
        url.searchParams.set("radius", String(location.radius));
        url.searchParams.set("sort", "distance");
    }

    const payload = await requestKakaoLocal<KakaoKeywordSearchResponse>(url);

    if (!Array.isArray(payload.documents)) {
        throw new KakaoLocalApiError("Kakao Local API documents 응답이 올바르지 않습니다.");
    }

    return payload.documents
        .map((document) => ({
            label: document.place_name,
            source: "search" as const,
            lat: Number(document.y),
            lng: Number(document.x),
        }))
        .filter((place) => Number.isFinite(place.lat) && Number.isFinite(place.lng));
}

async function searchPlacesByCategoryGroup(input: {
    categoryGroupCode: string;
    lat: number;
    lng: number;
    radius: number;
    size: number;
}) {
    const url = new URL("https://dapi.kakao.com/v2/local/search/category.json");

    url.searchParams.set("category_group_code", input.categoryGroupCode);
    url.searchParams.set("y", String(input.lat));
    url.searchParams.set("x", String(input.lng));
    url.searchParams.set("radius", String(input.radius));
    url.searchParams.set("sort", "distance");
    url.searchParams.set("size", String(input.size));

    const payload = await requestKakaoLocal<KakaoCategorySearchResponse>(url);

    if (!Array.isArray(payload.documents)) {
        throw new KakaoLocalApiError("Kakao Local API category documents 응답이 올바르지 않습니다.");
    }

    return payload.documents.map(normalizeKakaoPlace).filter((place): place is KakaoPlaceCandidate => Boolean(place));
}

function dedupeCandidates(candidates: KakaoPlaceCandidate[]) {
    const uniqueCandidates = new Map<string, KakaoPlaceCandidate>();

    candidates.forEach((candidate) => {
        uniqueCandidates.set(
            `${candidate.name}:${candidate.lat.toFixed(6)}:${candidate.lng.toFixed(6)}`,
            candidate,
        );
    });

    return [...uniqueCandidates.values()];
}

// 추천 반경 검색은 category 기준으로 Kakao Local 후보를 정규화해 반환한다.
export async function fetchPlaceCandidatesByRadius(input: {
    midpoint: { lat: number; lng: number };
    category: "cafe" | "meal" | "fun";
    radius: number;
    size: number;
}) {
    if (input.category === "fun") {
        const candidateGroups = await Promise.all(
            FUN_KEYWORD_QUERIES.map((keyword) =>
                searchPlacesByKeyword(keyword, Math.max(3, Math.ceil(input.size / 2)), {
                    lat: input.midpoint.lat,
                    lng: input.midpoint.lng,
                    radius: input.radius,
                }),
            ),
        );

        return dedupeCandidates(
            candidateGroups
                .flat()
                .map((candidate) => ({
                    name: candidate.label,
                    category: "놀거리",
                    lat: candidate.lat,
                    lng: candidate.lng,
                    address: candidate.label,
                    categoryGroupCode: "FUN",
                })),
        ).slice(0, input.size);
    }

    return searchPlacesByCategoryGroup({
        categoryGroupCode: CATEGORY_GROUP_CODE_MAP[input.category],
        lat: input.midpoint.lat,
        lng: input.midpoint.lng,
        radius: input.radius,
        size: input.size,
    });
}