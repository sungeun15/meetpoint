import type { KakaoMapInstance } from "@/lib/kakao/map-loader";

import {
    buildInfoWindowContent,
    buildOverlappingPersonInfoWindowContentWithMidpoint,
} from "./chat-recommendation-map-popup";
import {
    createMarkerImage,
    createPersonGroupMarkerImage,
    type KakaoMapSdkInstance,
} from "./chat-recommendation-map-scene-helpers";
import type { MapMarker } from "../../types";

export type KakaoLatLngInstance = InstanceType<KakaoMapSdkInstance["maps"]["LatLng"]>;
type KakaoMarkerSceneInstance = InstanceType<KakaoMapSdkInstance["maps"]["Marker"]>;

export type RenderMarkersResult = {
    selectedPlaceMarkerInstance: KakaoMarkerSceneInstance | null; // 선택된 장소 마커의 Kakao Marker 인스턴스입니다.
    selectedPlaceMarkerData: MapMarker | null; // 선택된 장소 마커의 원본 데이터입니다.
    selectedPlaceMarkerPosition: KakaoLatLngInstance | null; // 선택된 장소 마커의 좌표입니다.
};

function resolveMarkerZIndex(marker: MapMarker) {
    if (marker.markerType === "person") {
        return 30;
    }

    if (marker.markerType === "midpoint") {
        return 20;
    }

    return 10;
}

function buildCoordinateKey(marker: MapMarker) {
    return `${marker.latitude.toFixed(6)}:${marker.longitude.toFixed(6)}`;
}

function buildOverlappingPersonMarkerGroups(markers: MapMarker[]) {
    const groupedPersonMarkers = new Map<string, MapMarker[]>();

    markers.forEach((marker) => {
        if (marker.markerType !== "person") {
            return;
        }

        const coordinateKey = buildCoordinateKey(marker);
        const existingGroup = groupedPersonMarkers.get(coordinateKey);

        if (existingGroup) {
            existingGroup.push(marker);
            return;
        }

        groupedPersonMarkers.set(coordinateKey, [marker]);
    });

    return groupedPersonMarkers;
}

function hasMidpointAtCoordinate(markers: MapMarker[], coordinateKey: string) {
    return markers.some((marker) => marker.markerType === "midpoint" && buildCoordinateKey(marker) === coordinateKey);
}

// 지도 위에 모든 마커를 그린 뒤, 선택된 장소 마커 정보를 함께 반환합니다.
export function renderMarkers(
    map: KakaoMapInstance,
    kakao: KakaoMapSdkInstance,
    markers: MapMarker[],
    selectedMarkerId: string | null,
    infoWindow: InstanceType<KakaoMapSdkInstance["maps"]["InfoWindow"]>,
    onMarkerSelect?: (markerId: string) => void,
): RenderMarkersResult {
    let selectedPlaceMarkerInstance: KakaoMarkerSceneInstance | null = null;
    let selectedPlaceMarkerData: MapMarker | null = null;
    let selectedPlaceMarkerPosition: KakaoLatLngInstance | null = null;
    const overlappingPersonMarkerGroups = buildOverlappingPersonMarkerGroups(markers);
    const renderedPersonGroupKeys = new Set<string>();

    markers.forEach((marker) => {
        if (marker.markerType === "person") {
            const coordinateKey = buildCoordinateKey(marker);
            const overlappingGroup = overlappingPersonMarkerGroups.get(coordinateKey);

            if (overlappingGroup && overlappingGroup.length > 1) {
                if (renderedPersonGroupKeys.has(coordinateKey)) {
                    return;
                }

                renderedPersonGroupKeys.add(coordinateKey);

                const position = new kakao.maps.LatLng(marker.latitude, marker.longitude);
                const markerInstance = new kakao.maps.Marker({
                    map,
                    position,
                    title: `${overlappingGroup.length}명 함께 있는 위치`,
                    image: createPersonGroupMarkerImage(kakao, overlappingGroup.length),
                    zIndex: 35,
                });
                const midpointAtSameLocation = hasMidpointAtCoordinate(markers, coordinateKey);

                kakao.maps.event.addListener(markerInstance, "click", () => {
                    infoWindow.setContent(
                        buildOverlappingPersonInfoWindowContentWithMidpoint(
                            overlappingGroup,
                            midpointAtSameLocation,
                        ),
                    );
                    infoWindow.open(map, markerInstance);
                });

                return;
            }
        }

        // recommendation 모듈 공통 MapMarker를 Kakao 지도 객체와 이미지로 변환합니다.
        const position = new kakao.maps.LatLng(marker.latitude, marker.longitude);
        const image = createMarkerImage(kakao, marker);

        const markerInstance = new kakao.maps.Marker({
            map,
            position,
            title: marker.label,
            image,
            zIndex: resolveMarkerZIndex(marker),
        });

        // 장소 마커 클릭 시 선택 상태와 InfoWindow를 함께 갱신합니다.
        kakao.maps.event.addListener(markerInstance, "click", () => {
            if (marker.markerType === "place") {
                onMarkerSelect?.(marker.id);
            }

            infoWindow.setContent(buildInfoWindowContent(marker));
            infoWindow.open(map, markerInstance);
        });

        // 장소 마커 중 현재 선택 id와 일치하는 항목은 별도로 기억해 초기 포커스에 사용합니다.
        if (marker.markerType === "place" && marker.id === selectedMarkerId) {
            selectedPlaceMarkerInstance = markerInstance;
            selectedPlaceMarkerData = marker;
            selectedPlaceMarkerPosition = position;
        }
    });

    return {
        selectedPlaceMarkerInstance,
        selectedPlaceMarkerData,
        selectedPlaceMarkerPosition,
    };
}

type ApplySelectedMarkerFocusArgs = {
    map: KakaoMapInstance; // 포커스를 실제로 적용할 지도 인스턴스입니다.
    renderedMarkers: RenderMarkersResult; // 마커 렌더 결과에서 선택된 장소 마커 정보를 담고 있습니다.
    infoWindow: InstanceType<KakaoMapSdkInstance["maps"]["InfoWindow"]>; // 선택된 마커 설명을 띄울 InfoWindow 인스턴스입니다.
};

// 선택된 장소 마커가 있으면 초기 InfoWindow와 포커스를 그 위치에 맞춥니다.
export function applySelectedMarkerInitialFocus({
    map,
    renderedMarkers,
    infoWindow,
}: ApplySelectedMarkerFocusArgs) {
    if (renderedMarkers.selectedPlaceMarkerInstance && renderedMarkers.selectedPlaceMarkerData) {
        infoWindow.setContent(buildInfoWindowContent(renderedMarkers.selectedPlaceMarkerData));
        infoWindow.open(map, renderedMarkers.selectedPlaceMarkerInstance);
    }

    // 선택 장소가 있으면 초기 진입 시 바로 해당 카드/마커를 중심으로 확대합니다.
    if (renderedMarkers.selectedPlaceMarkerPosition) {
        map.setCenter(renderedMarkers.selectedPlaceMarkerPosition);
        map.setLevel(3, { animate: { duration: 250 } });
    }

    return renderedMarkers.selectedPlaceMarkerPosition;
}
