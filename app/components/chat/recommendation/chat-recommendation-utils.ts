import type { LocationPoint } from "../types";

// 도 단위 위경도 차이를 하버사인 공식 계산용 라디안으로 변환합니다.
function toRadians(value: number) {
    return (value * Math.PI) / 180;
}

// 두 좌표 사이의 대략적인 직선거리를 km 단위로 계산합니다.
export function calculateDistanceKm(start: LocationPoint, end: LocationPoint) {
    const earthRadiusKm = 6371;
    const latitudeDelta = toRadians(end.latitude - start.latitude);
    const longitudeDelta = toRadians(end.longitude - start.longitude);
    const startLatitude = toRadians(start.latitude);
    const endLatitude = toRadians(end.latitude);

    const haversine = Math.sin(latitudeDelta / 2) ** 2
        + Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) ** 2;
    const centralAngle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

    return earthRadiusKm * centralAngle;
}

// 여러 좌표의 단순 평균 중심점을 계산해 중간 만남 지점 기준으로 사용합니다.
export function calculateMidpoint(points: LocationPoint[]) {
    if (points.length === 0) {
        return null;
    }

    const aggregatePoint = points.reduce(
        (accumulator, point) => ({
            latitude: accumulator.latitude + point.latitude,
            longitude: accumulator.longitude + point.longitude,
        }),
        { latitude: 0, longitude: 0 },
    );

    return {
        latitude: aggregatePoint.latitude / points.length,
        longitude: aggregatePoint.longitude / points.length,
    } satisfies LocationPoint;
}

// 중심점 근접도와 두 사람 이동 거리 균형을 반영해 추천 점수를 계산합니다.
export function calculateRecommendationScore(args: {
    midpointDistanceKm: number; // 후보 장소가 중심점에서 얼마나 떨어졌는지 나타냅니다.
    myDistanceKm: number; // 내가 이동해야 하는 거리입니다.
    friendDistanceKm: number; // 친구가 이동해야 하는 거리입니다.
}) {
    const balanceGap = Math.abs(args.myDistanceKm - args.friendDistanceKm);

    return Math.max(
        60,
        Math.round(
            100
            - args.midpointDistanceKm * 12
            - balanceGap * 18
            - (args.myDistanceKm + args.friendDistanceKm) * 6,
        ),
    );
}