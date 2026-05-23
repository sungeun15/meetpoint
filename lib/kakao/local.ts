type KakaoKeywordSearchDocument = {
    // 장소 고유 id 입니다.
    id: string;
    // 장소명입니다.
    place_name: string;
    // Kakao가 반환한 전체 카테고리 경로입니다.
    category_name: string;
    // 대표 카테고리 그룹 코드입니다.
    category_group_code: string;
    // 지번 주소입니다.
    address_name: string;
    // 도로명 주소입니다.
    road_address_name: string;
    // 경도 문자열입니다.
    x: string;
    // 위도 문자열입니다.
    y: string;
};

type KakaoKeywordSearchResponse = {
    // 키워드 검색 결과 문서 목록입니다.
    documents: KakaoKeywordSearchDocument[];
};

type KakaoCategorySearchResponse = {
    // 카테고리 검색 결과 문서 목록입니다.
    documents: KakaoKeywordSearchDocument[];
};

const CATEGORY_GROUP_CODE_MAP = {
    cafe: "CE7",
    meal: "FD6",
} as const;

const FUN_KEYWORD_QUERIES = ["영화관", "노래방", "보드게임", "볼링장", "방탈출", "문화시설"] as const;

export type DepartureSearchItem = {
    // 검색 결과 목록에 보여줄 라벨입니다.
    label: string;
    // later 출발지 검색에서 생성된 항목임을 구분합니다.
    source: "search";
    // 검색 결과 위도입니다.
    lat: number;
    // 검색 결과 경도입니다.
    lng: number;
};

export type KakaoPlaceCandidate = {
    // 추천 후보 장소명입니다.
    name: string;
    // 정규화된 카테고리 문자열입니다.
    category: string;
    // 장소 위도입니다.
    lat: number;
    // 장소 경도입니다.
    lng: number;
    // 화면 표시용 주소입니다.
    address: string;
    // Kakao 카테고리 그룹 코드입니다.
    categoryGroupCode: string;
};

export class KakaoLocalApiError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "KakaoLocalApiError";
    }
}

function normalizeKakaoPlace(document: KakaoKeywordSearchDocument): KakaoPlaceCandidate | null {
    // Kakao 응답 좌표는 문자열이므로 숫자로 변환한 뒤 유효성까지 확인합니다.
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
    // 공통 fetch 래퍼에서 인증 헤더와 JSON 파싱 오류 처리를 함께 담당합니다.
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
    // Kakao 카테고리 그룹 코드입니다.
    categoryGroupCode: string;
    // 검색 중심점 위도입니다.
    lat: number;
    // 검색 중심점 경도입니다.
    lng: number;
    // 검색 반경(m)입니다.
    radius: number;
    // 최대 반환 개수입니다.
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
    // 같은 장소명이더라도 좌표가 다르면 별개 후보로 유지합니다.
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
    // 추천 중심점입니다.
    midpoint: { lat: number; lng: number };
    // 추천 카테고리입니다.
    category: "cafe" | "meal" | "fun";
    // 검색 반경(m)입니다.
    radius: number;
    // 최대 후보 개수입니다.
    size: number;
}) {
    if (input.category === "fun") {
        // 놀거리 카테고리는 단일 그룹 코드가 부족해서 다중 키워드 검색 결과를 합칩니다.
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