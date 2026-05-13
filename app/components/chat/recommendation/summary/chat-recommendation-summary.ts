import type { LocationPoint, MeetingMode } from "../../types";

// 추천 결과 카드에서 사용할 모임 방식 라벨을 화면 문구로 변환합니다.
export function getMeetingModeLabel(meetingMode: MeetingMode) {
    return meetingMode === "now" ? "지금 만나기" : "나중에 만나기";
}

// 출발지 라벨이 너무 길 때 핵심 정보만 남기도록 정리합니다.
export function formatDepartureSummaryLabel(rawLabel: string | null | undefined, fallbackLabel: string) {
    const normalizedLabel = rawLabel?.replace(/\s+/g, " ").trim() ?? "";

    if (!normalizedLabel) {
        return fallbackLabel;
    }

    if (normalizedLabel.includes("브라우저 현재 위치")) {
        return "현재 위치";
    }

    const stationExitMatch = normalizedLabel.match(/([^\s]+역\s*\d+번\s*출구)$/);

    if (stationExitMatch) {
        return stationExitMatch[1].replace(/\s+/g, " ");
    }

    const labelTokens = normalizedLabel.split(" ");
    const lastToken = labelTokens.at(-1) ?? "";

    if (/^\d+(?:-\d+)?$/.test(lastToken) && labelTokens.length >= 3) {
        return labelTokens.slice(-3).join(" ");
    }

    if (labelTokens.length >= 2) {
        return labelTokens.slice(-2).join(" ");
    }

    return normalizedLabel;
}

// 나와 친구의 출발지 정보를 여러 줄 요약 문구로 합칩니다.
export function buildDepartureSummaryText(baseLabel: string, meLabel: string, friendName: string, friendLabel: string) {
    return `${baseLabel}\n나: ${meLabel}\n${friendName}: ${friendLabel}`;
}

// 추천 장소까지의 직선거리를 카드 표시용 문자열로 포맷합니다.
export function formatRecommendationDistance(distanceKm: number) {
    return `${distanceKm.toFixed(distanceKm < 1 ? 2 : 1)}km`;
}

// 직선거리를 기준으로 대략적인 도로 이동 거리를 계산해 보여 줍니다.
function formatEstimatedDrivingDistance(distanceKm: number) {
    const estimatedRoadDistanceKm = distanceKm * 1.28;

    return `${estimatedRoadDistanceKm.toFixed(estimatedRoadDistanceKm < 10 ? 1 : 0)}km`;
}

// 예상 도로 거리와 평균 속도를 이용해 운전 소요 시간을 추정합니다.
function formatEstimatedDrivingDuration(distanceKm: number) {
    const estimatedRoadDistanceKm = distanceKm * 1.28;
    const estimatedMinutes = Math.max(4, Math.round((estimatedRoadDistanceKm / 28) * 60));

    if (estimatedMinutes >= 60) {
        const hours = Math.floor(estimatedMinutes / 60);
        const minutes = estimatedMinutes % 60;

        return minutes > 0 ? `${hours}시간 ${minutes}분` : `${hours}시간`;
    }

    return `${estimatedMinutes}분`;
}

// 카드에 노출할 거리/시간 복합 문구를 조합합니다.
export function formatDrivingEstimate(distanceKm: number) {
    return `약 ${formatEstimatedDrivingDistance(distanceKm)} · ${formatEstimatedDrivingDuration(distanceKm)}`;
}

// 좌표값을 사람이 읽기 쉬운 미리보기 문자열로 바꿉니다.
export function formatLocationPreview(point: LocationPoint) {
    return `위도 ${point.latitude.toFixed(4)} · 경도 ${point.longitude.toFixed(4)}`;
}

// 중간 지점 좌표를 요약 카드 전용 줄바꿈 형식으로 변환합니다.
export function buildMidpointSummaryText(latitude: number, longitude: number) {
    return formatLocationPreview({ latitude, longitude }).replace(" · ", "\n").replace("위도 ", "위도: ").replace("경도 ", "경도: ");
}