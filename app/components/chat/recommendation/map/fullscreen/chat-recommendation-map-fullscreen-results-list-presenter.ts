import type {
    RecommendationRouteSegment,
    RecommendationRouteStatus,
    RecommendationTransportMode,
} from "../../../types";

export const TRANSPORT_MODE_OPTIONS: Array<{ mode: RecommendationTransportMode; label: string }> = [
    { mode: "bus", label: "버스" },
    { mode: "car", label: "자동차" },
    { mode: "bike", label: "자전거" },
    { mode: "walk", label: "도보" },
];

export function buildRouteStatusLabel(
    routeStatus: RecommendationRouteStatus,
    routeSegments: RecommendationRouteSegment[],
) {
    if (routeStatus === "loading") {
        return "경로 계산 중";
    }

    if (routeStatus === "error") {
        return "경로 불러오기 실패";
    }

    if (routeStatus === "ready" && routeSegments.length > 0) {
        return "경로 준비 완료";
    }

    if (routeStatus === "ready") {
        return "표시할 경로 없음";
    }

    return "이동 수단 선택";
}