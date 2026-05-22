import type { KakaoMapInstance } from "@/lib/kakao/map-loader";

import {
    fitMapToMarkerBounds,
    type KakaoMapSdkInstance,
} from "./chat-recommendation-map-scene-helpers";
import type { KakaoLatLngInstance } from "./chat-recommendation-map-scene-runtime";
import type { MapMarker } from "../../types";

type RecommendationMapViewportArgs = {
    map: KakaoMapInstance; // 뷰포트를 조정할 지도 인스턴스입니다.
    kakao: KakaoMapSdkInstance; // bounds 계산에 필요한 Kakao SDK 인스턴스입니다.
    markers: MapMarker[]; // 현재 렌더 중인 마커 목록입니다.
    center: KakaoLatLngInstance; // 마커가 없을 때 사용할 기본 중심 좌표입니다.
    selectedPlaceMarkerPosition: KakaoLatLngInstance | null; // 선택된 장소 마커 좌표가 있으면 이 위치를 우선 포커스합니다.
    selectedPlaceFocusLevel: number; // 선택된 장소를 다시 포커스할 때 유지할 줌 레벨입니다.
};

// scene 최초 생성 직후 추천 상태에 맞는 초기 뷰포트를 적용합니다.
export function applyInitialRecommendationMapViewport({
    map,
    kakao,
    markers,
    center,
    selectedPlaceMarkerPosition,
    selectedPlaceFocusLevel,
}: RecommendationMapViewportArgs) {
    // 마커가 없으면 기본 중심 좌표와 더 넓은 레벨로 초기 지도를 보여 줍니다.
    if (markers.length === 0) {
        map.setCenter(center);
        map.setLevel(6);
        return;
    }

    fitMapToMarkerBounds(map, kakao, markers);

    if (selectedPlaceMarkerPosition) {
        map.setCenter(selectedPlaceMarkerPosition);
        map.setLevel(selectedPlaceFocusLevel, { animate: { duration: 250 } });
    }
}

// 마커/선택 상태 변화 이후 현재 상황에 맞는 뷰포트를 다시 동기화합니다.
export function syncRecommendationMapViewport({
    map,
    kakao,
    markers,
    center,
    selectedPlaceMarkerPosition,
    selectedPlaceFocusLevel,
}: RecommendationMapViewportArgs) {
    if (selectedPlaceMarkerPosition) {
        map.setCenter(selectedPlaceMarkerPosition);
        map.setLevel(selectedPlaceFocusLevel);
        return;
    }

    // 선택 마커가 없으면 전체 마커 bounds 기준으로 다시 맞추고, 마커도 없으면 기본 중심으로 돌아갑니다.
    if (markers.length > 0) {
        fitMapToMarkerBounds(map, kakao, markers);
        return;
    }

    map.setCenter(center);
}

type CreateMapResizeObserverArgs = RecommendationMapViewportArgs;

// ResizeObserver를 통해 컨테이너 크기 변화 시 지도 relayout과 뷰포트 재동기화를 수행합니다.
export function createMapResizeObserver({
    map,
    kakao,
    markers,
    center,
    selectedPlaceMarkerPosition,
    selectedPlaceFocusLevel,
}: CreateMapResizeObserverArgs) {
    return new ResizeObserver(() => {
        // 컨테이너 크기 변화 후에는 relayout 없이 bounds가 어긋날 수 있어 항상 같이 호출합니다.
        map.relayout();
        syncRecommendationMapViewport({
            map,
            kakao,
            markers,
            center,
            selectedPlaceMarkerPosition,
            selectedPlaceFocusLevel,
        });
    });
}