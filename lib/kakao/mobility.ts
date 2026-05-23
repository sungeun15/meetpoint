import type { RecommendationRoutePathPoint } from "@/lib/contracts/recommendation-routes";

type KakaoMobilityDirectionsRoad = {
    // [lng, lat] 순서가 반복되는 선분 좌표 배열입니다.
    vertexes: number[];
};

type KakaoMobilityDirectionsSection = {
    // 경로 구간별 도로 목록입니다.
    roads?: KakaoMobilityDirectionsRoad[];
};

type KakaoMobilityDirectionsRoute = {
    // 0이면 정상 응답입니다.
    result_code: number;
    // Kakao Mobility가 반환한 결과 설명입니다.
    result_msg: string;
    summary?: {
        // 전체 이동 거리(m)입니다.
        distance: number;
        // 전체 이동 시간(초)입니다.
        duration: number;
    };
    // 실제 경로 선분이 들어 있는 구간 목록입니다.
    sections?: KakaoMobilityDirectionsSection[];
};

type KakaoMobilityDirectionsResponse = {
    // 길찾기 후보 경로 목록입니다.
    routes?: KakaoMobilityDirectionsRoute[];
    // API 실패 시 제공되는 에러 코드입니다.
    code?: number;
    // API 실패 시 제공되는 에러 메시지입니다.
    msg?: string;
};

export class KakaoMobilityApiError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "KakaoMobilityApiError";
    }
}

type RequestKakaoMobilityDirectionsArgs = {
    origin: {
        // Kakao 경유지 파라미터에 함께 넣는 출발지 라벨입니다.
        label: string;
        // 출발지 위도입니다.
        latitude: number;
        // 출발지 경도입니다.
        longitude: number;
    };
    destination: {
        // 목적지 라벨입니다.
        label: string;
        // 목적지 위도입니다.
        latitude: number;
        // 목적지 경도입니다.
        longitude: number;
    };
};

export type KakaoMobilityDirectionsResult = {
    // 총 이동 거리(m)입니다.
    distanceMeters: number;
    // 총 이동 시간(초)입니다.
    durationSeconds: number;
    // 지도에 바로 그릴 수 있는 경로 좌표 배열입니다.
    path: RecommendationRoutePathPoint[];
};

function getKakaoMobilityApiKey() {
    // 전용 키가 있으면 우선 사용하고, 기존 Local 키도 하위 호환으로 허용합니다.
    const restApiKey = process.env.KAKAO_MOBILITY_REST_API_KEY?.trim() || process.env.KAKAO_LOCAL_REST_API_KEY?.trim();

    if (!restApiKey) {
        throw new KakaoMobilityApiError("KAKAO_MOBILITY_REST_API_KEY 또는 KAKAO_LOCAL_REST_API_KEY가 설정되지 않았습니다.");
    }

    return restApiKey;
}

function buildDirectionsUrl({ origin, destination }: RequestKakaoMobilityDirectionsArgs) {
    // 자동차 길찾기 API는 origin/destination 을 "경도,위도,name=라벨" 형식으로 받습니다.
    const url = new URL("https://apis-navi.kakaomobility.com/v1/directions");

    url.searchParams.set("origin", `${origin.longitude},${origin.latitude},name=${origin.label}`);
    url.searchParams.set("destination", `${destination.longitude},${destination.latitude},name=${destination.label}`);
    url.searchParams.set("priority", "RECOMMEND");
    url.searchParams.set("summary", "false");
    url.searchParams.set("alternatives", "false");
    url.searchParams.set("road_details", "false");
    url.searchParams.set("car_fuel", "GASOLINE");
    url.searchParams.set("car_hipass", "false");

    return url;
}

function normalizeVertexes(vertexes: number[]) {
    // 응답 vertexes 는 [lng, lat, lng, lat, ...] 구조라 2개씩 끊어 경로 점으로 변환합니다.
    const path: RecommendationRoutePathPoint[] = [];

    for (let index = 0; index < vertexes.length; index += 2) {
        const longitude = vertexes[index];
        const latitude = vertexes[index + 1];

        if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
            continue;
        }

        const previousPoint = path[path.length - 1];

        if (
            previousPoint
            && previousPoint.latitude === latitude
            && previousPoint.longitude === longitude
        ) {
            continue;
        }

        path.push({
            latitude,
            longitude,
        });
    }

    return path;
}

function extractPath(route: KakaoMobilityDirectionsRoute) {
    // section/road 단위로 흩어진 선분을 하나의 path 배열로 평탄화합니다.
    const path = route.sections?.flatMap((section) =>
        (section.roads ?? []).flatMap((road) => normalizeVertexes(road.vertexes)),
    ) ?? [];

    if (path.length < 2) {
        throw new KakaoMobilityApiError("Kakao Mobility 자동차 길찾기 응답에 경로 좌표가 없습니다.");
    }

    return path;
}

export async function requestKakaoMobilityDirections(
    input: RequestKakaoMobilityDirectionsArgs,
): Promise<KakaoMobilityDirectionsResult> {
    // API 오류 메시지까지 최대한 보존하려고 먼저 text 로 읽고 이후 JSON 파싱을 시도합니다.
    const response = await fetch(buildDirectionsUrl(input), {
        headers: {
            Authorization: `KakaoAK ${getKakaoMobilityApiKey()}`,
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });
    const body = await response.text();
    let payload: KakaoMobilityDirectionsResponse | null = null;

    try {
        payload = JSON.parse(body) as KakaoMobilityDirectionsResponse;
    } catch {
        payload = null;
    }

    if (!response.ok) {
        const errorMessage = payload?.msg
            ? `Kakao Mobility 길찾기 API 요청이 실패했습니다: ${payload.msg}`
            : `Kakao Mobility 길찾기 API 요청이 실패했습니다: ${response.status} ${response.statusText}`;

        throw new KakaoMobilityApiError(errorMessage);
    }

    const route = payload?.routes?.[0];

    if (!route) {
        throw new KakaoMobilityApiError("Kakao Mobility 길찾기 응답에 routes 정보가 없습니다.");
    }

    if (route.result_code !== 0 || !route.summary) {
        throw new KakaoMobilityApiError(route.result_msg || "Kakao Mobility 길찾기 결과를 찾지 못했습니다.");
    }

    return {
        distanceMeters: route.summary.distance,
        durationSeconds: route.summary.duration,
        path: extractPath(route),
    };
}
