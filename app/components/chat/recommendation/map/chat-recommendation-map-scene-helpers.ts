import { loadKakaoMapSdk, type KakaoMapInstance } from "@/lib/kakao/map-loader";
import { MAP_BOUNDS_PADDING } from "../chat-recommendation-layout";
import { defaultMapCenter } from "../chat-recommendation-data";
import {
    createMidpointMarkerImage,
    createPersonGroupMarkerImage,
    createPersonMarkerImage,
    createPlaceMarkerImage,
} from "./kakao-marker-icons";
import type { MapMarker } from "../../types";

export type KakaoMapSdkInstance = Awaited<ReturnType<typeof loadKakaoMapSdk>>;
export { createPersonGroupMarkerImage };

type ConnectionSegment = {
    path: ReturnType<typeof buildCurvedSegmentPath>; // 지도에 그릴 곡선 경로 좌표입니다.
    strokeColor: string; // 연결선 색상입니다.
};

// 두 마커 사이를 직선 대신 부드러운 곡선 경로로 연결합니다.
function buildCurvedSegmentPath(
    kakao: KakaoMapSdkInstance,
    startMarker: MapMarker,
    endMarker: MapMarker,
    curveDirection: 1 | -1,
) {
    const latitudeDelta = endMarker.latitude - startMarker.latitude;
    const longitudeDelta = endMarker.longitude - startMarker.longitude;
    const straightDistance = Math.hypot(latitudeDelta, longitudeDelta);

    // 같은 좌표면 곡선을 만들 수 없으므로 시작점과 끝점만 그대로 반환합니다.
    if (straightDistance === 0) {
        return [
            new kakao.maps.LatLng(startMarker.latitude, startMarker.longitude),
            new kakao.maps.LatLng(endMarker.latitude, endMarker.longitude),
        ];
    }

    const midpointLatitude = (startMarker.latitude + endMarker.latitude) / 2;
    const midpointLongitude = (startMarker.longitude + endMarker.longitude) / 2;
    const normalizedPerpendicularLatitude = (-longitudeDelta / straightDistance) * curveDirection;
    const normalizedPerpendicularLongitude = (latitudeDelta / straightDistance) * curveDirection;
    const curveOffset = Math.min(Math.max(straightDistance * 0.18, 0.0015), 0.01);
    const controlLatitude = midpointLatitude + normalizedPerpendicularLatitude * curveOffset;
    const controlLongitude = midpointLongitude + normalizedPerpendicularLongitude * curveOffset;

    // 2차 베지어 곡선을 몇 개의 샘플 점으로 나눠 Kakao Polyline 경로로 변환합니다.
    return [0, 0.35, 0.68, 1].map((t) => {
        const inverseT = 1 - t;
        const latitude = inverseT * inverseT * startMarker.latitude
            + 2 * inverseT * t * controlLatitude
            + t * t * endMarker.latitude;
        const longitude = inverseT * inverseT * startMarker.longitude
            + 2 * inverseT * t * controlLongitude
            + t * t * endMarker.longitude;

        return new kakao.maps.LatLng(latitude, longitude);
    });
}

// 내 위치-중심점-친구 위치를 잇는 연결선 정보를 계산합니다.
function buildConnectionSegments(kakao: KakaoMapSdkInstance, markers: MapMarker[]): ConnectionSegment[] {
    const meMarker = markers.find((marker) => marker.id === "me");
    const midpointMarker = markers.find((marker) => marker.id === "midpoint");
    const friendMarker = markers.find((marker) => marker.id === "friend");

    if (!meMarker || !midpointMarker || !friendMarker) {
        return [];
    }

    return [
        {
            path: buildCurvedSegmentPath(kakao, meMarker, midpointMarker, -1),
            strokeColor: "#4F7CFF",
        },
        {
            path: buildCurvedSegmentPath(kakao, midpointMarker, friendMarker, 1),
            strokeColor: "#7C4DFF",
        },
    ];
}

// 마커 타입에 맞는 Kakao MarkerImage를 생성합니다.
export function createMarkerImage(kakao: KakaoMapSdkInstance, marker: MapMarker) {
    if (marker.markerType === "person") {
        return createPersonMarkerImage(kakao, marker.id === "me" ? "me" : "friend");
    }

    if (marker.markerType === "midpoint") {
        return createMidpointMarkerImage(kakao);
    }

    if (marker.markerType === "place") {
        return createPlaceMarkerImage(kakao, marker);
    }

    return undefined;
}

// 현재 마커 전체를 감싸는 bounds를 계산합니다.
function buildMarkerBounds(kakao: KakaoMapSdkInstance, markers: MapMarker[]) {
    const bounds = new kakao.maps.LatLngBounds();

    markers.forEach((marker) => {
        bounds.extend(new kakao.maps.LatLng(marker.latitude, marker.longitude));
    });

    return bounds;
}

// 모든 마커가 보이도록 지도 bounds를 맞춥니다.
export function fitMapToMarkerBounds(
    map: KakaoMapInstance,
    kakao: KakaoMapSdkInstance,
    markers: MapMarker[],
) {
    if (markers.length === 0) {
        return;
    }

    // 지도 패널 UI 여백을 고려해 모든 마커가 보이는 bounds를 적용합니다.
    const bounds = buildMarkerBounds(kakao, markers);

    map.setBounds(
        bounds,
        MAP_BOUNDS_PADDING.top,
        MAP_BOUNDS_PADDING.right,
        MAP_BOUNDS_PADDING.bottom,
        MAP_BOUNDS_PADDING.left,
    );
}

// 중심점 마커가 있으면 우선 사용하고, 없으면 기본 중심 좌표를 반환합니다.
export function resolveMapCenter(kakao: KakaoMapSdkInstance, markers: MapMarker[]) {
    const centerMarker = markers.find((marker) => marker.id === "midpoint") ?? markers[0] ?? null;

    return new kakao.maps.LatLng(
        centerMarker?.latitude ?? defaultMapCenter.latitude,
        centerMarker?.longitude ?? defaultMapCenter.longitude,
    );
}

// Kakao 기본 지도 컨트롤과 공통 옵션을 세팅합니다.
export function configureMap(map: KakaoMapInstance, kakao: KakaoMapSdkInstance) {
    map.setMinLevel(2);
    map.setMaxLevel(9);
    map.setKeyboardShortcuts(true);
    map.setCopyrightPosition(kakao.maps.CopyrightPosition.BOTTOMRIGHT, true);
    map.setCursor("grab");

    const mapTypeControl = new kakao.maps.MapTypeControl();
    const zoomControl = new kakao.maps.ZoomControl();
    map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);
    map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
}

// 사람-중심점 사이의 연결선을 지도 위에 렌더합니다.
export function renderConnectionSegments(
    map: KakaoMapInstance,
    kakao: KakaoMapSdkInstance,
    markers: MapMarker[],
) {
    const connectionSegments = buildConnectionSegments(kakao, markers);

    // 내 위치-중심점, 중심점-친구 위치를 서로 다른 색의 곡선으로 시각화합니다.
    connectionSegments.forEach((segment) => {
        new kakao.maps.Polyline({
            map,
            path: segment.path,
            strokeWeight: 5,
            strokeColor: segment.strokeColor,
            strokeOpacity: 0.9,
            strokeStyle: "solid",
            zIndex: 1,
        });
    });
}