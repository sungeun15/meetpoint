export type CoordinatePoint = {
    lat: number;
    lng: number;
};

function toRadians(value: number) {
    return (value * Math.PI) / 180;
}

// 추천 API는 두 출발점의 단순 평균 중심점을 사용한다.
export function calculateMidpoint(user: CoordinatePoint, friend: CoordinatePoint) {
    return {
        lat: (user.lat + friend.lat) / 2,
        lng: (user.lng + friend.lng) / 2,
    };
}

// 두 좌표 간 거리를 meter 단위로 계산해 score 입력값으로 사용한다.
export function haversineDistance(start: CoordinatePoint, end: CoordinatePoint) {
    const earthRadiusMeter = 6371000;
    const latitudeDelta = toRadians(end.lat - start.lat);
    const longitudeDelta = toRadians(end.lng - start.lng);
    const startLatitude = toRadians(start.lat);
    const endLatitude = toRadians(end.lat);

    const haversine = Math.sin(latitudeDelta / 2) ** 2
        + Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) ** 2;
    const centralAngle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

    return earthRadiusMeter * centralAngle;
}