import { loadKakaoMapSdk, type KakaoMapInstance } from "@/lib/kakao/map-loader";
import {
    configureMap,
    renderConnectionSegments,
    renderRecommendationRouteSegments,
    resolveMapCenter,
    type KakaoMapSdkInstance,
} from "./chat-recommendation-map-scene-helpers";
import {
    applySelectedMarkerInitialFocus,
    focusSelectedMarker,
    renderMarkers,
    type KakaoLatLngInstance,
    type RenderMarkersResult,
} from "./chat-recommendation-map-scene-runtime";
import {
    applyInitialRecommendationMapViewport,
    createMapResizeObserver,
    syncRecommendationMapViewport,
} from "./chat-recommendation-map-scene-state";
import type { MapMarker, RecommendationRouteSegment } from "../../types";
import type { KakaoPolylineSceneInstance } from "./chat-recommendation-map-scene-helpers";

export { fitMapToMarkerBounds } from "./chat-recommendation-map-scene-helpers";
export type { KakaoMapSdkInstance } from "./chat-recommendation-map-scene-helpers";

const RECOMMENDATION_MAP_INFO_WINDOW_Z_INDEX = 100;
const DEFAULT_SELECTED_PLACE_FOCUS_LEVEL = 3;

type RecommendationMapScene = {
    map: KakaoMapInstance;
    kakao: KakaoMapSdkInstance;
    resizeObserver: ResizeObserver;
    infoWindow: InstanceType<KakaoMapSdkInstance["maps"]["InfoWindow"]>;
    renderedMarkers: RenderMarkersResult;
    routePolylines: KakaoPolylineSceneInstance[];
};

type CreateRecommendationMapSceneArgs = {
    container: HTMLDivElement; // Kakao 지도를 실제로 붙일 DOM 컨테이너입니다.
    markers: MapMarker[]; // 현재 지도에 렌더할 전체 마커 배열입니다.
    selectedMarkerId: string | null; // 초기 강조 대상이 되는 장소 마커 id입니다.
    selectedPlaceFocusLevel?: number | null; // 선택 장소를 다시 포커스할 때 유지할 줌 레벨입니다.
    routeSegments: RecommendationRouteSegment[]; // 함께 렌더할 길찾기 경로 세그먼트입니다.
    onMarkerSelect?: (markerId: string) => void; // 장소 마커 클릭 시 상위 상태를 갱신하는 콜백입니다.
    onMapIdle: () => void; // 지도 상태가 안정화됐을 때 동기화할 콜백입니다.
};

// 지도 초기화, 마커 렌더링, 뷰포트 동기화까지 포함한 scene 생성기입니다.
export async function createRecommendationMapScene({
    container,
    markers,
    selectedMarkerId,
    selectedPlaceFocusLevel,
    routeSegments,
    onMarkerSelect,
    onMapIdle,
}: CreateRecommendationMapSceneArgs) {
    // SDK 로드 이후 현재 마커 상황에 맞는 중심점으로 지도를 초기화합니다.
    const kakao = await loadKakaoMapSdk();
    const center = resolveMapCenter(kakao, markers);
    const normalizedSelectedPlaceFocusLevel = selectedPlaceFocusLevel ?? DEFAULT_SELECTED_PLACE_FOCUS_LEVEL;
    const map = new kakao.maps.Map(container, {
        center,
        level: 5,
        mapTypeId: kakao.maps.MapTypeId.ROADMAP,
        draggable: true,
        scrollwheel: true,
        keyboardShortcuts: true,
        tileAnimation: true,
    });

    configureMap(map, kakao);

    const infoWindow = new kakao.maps.InfoWindow({
        removable: true,
        zIndex: RECOMMENDATION_MAP_INFO_WINDOW_Z_INDEX,
    });
    let selectedPlaceMarkerPosition: KakaoLatLngInstance | null = null;
    let renderedMarkers: RenderMarkersResult = {
        selectedPlaceMarkerInstance: null,
        selectedPlaceMarkerData: null,
        selectedPlaceMarkerPosition: null,
        placeMarkerEntriesById: new Map(),
    };
    let routePolylines: KakaoPolylineSceneInstance[] = [];

    // 마커가 있을 때만 연결선, 마커 렌더링, 선택 마커 초기 포커스를 적용합니다.
    if (markers.length > 0) {
        renderConnectionSegments(map, kakao, markers);
        routePolylines = renderRecommendationRouteSegments(map, kakao, routeSegments);

        renderedMarkers = renderMarkers(map, kakao, markers, selectedMarkerId, infoWindow, onMarkerSelect);
        selectedPlaceMarkerPosition = applySelectedMarkerInitialFocus({
            map,
            renderedMarkers,
            infoWindow,
            selectedPlaceFocusLevel: normalizedSelectedPlaceFocusLevel,
        });
    }

    // 초기 렌더 직후 한 번, 그리고 resize/idle 시점마다 viewport를 안정적으로 맞춥니다.
    applyInitialRecommendationMapViewport({
        map,
        kakao,
        markers,
        center,
        selectedPlaceMarkerPosition,
        selectedPlaceFocusLevel: normalizedSelectedPlaceFocusLevel,
    });

    const resizeObserver = createMapResizeObserver({
        map,
        kakao,
        markers,
        center,
        selectedPlaceMarkerPosition,
        selectedPlaceFocusLevel: normalizedSelectedPlaceFocusLevel,
    });

    kakao.maps.event.addListener(map, "idle", onMapIdle);
    kakao.maps.event.addListener(map, "click", () => {
        infoWindow.close();
    });

    map.relayout();
    syncRecommendationMapViewport({
        map,
        kakao,
        markers,
        center,
        selectedPlaceMarkerPosition,
        selectedPlaceFocusLevel: normalizedSelectedPlaceFocusLevel,
    });
    resizeObserver.observe(container);

    return {
        map,
        kakao,
        resizeObserver,
        infoWindow,
        renderedMarkers,
        routePolylines,
    };
}

type UpdateRecommendationMapSceneSelectionArgs = {
    scene: RecommendationMapScene;
    selectedMarkerId: string | null;
};

export function updateRecommendationMapSceneSelection({
    scene,
    selectedMarkerId,
}: UpdateRecommendationMapSceneSelectionArgs) {
    if (!selectedMarkerId) {
        scene.infoWindow.close();
        return;
    }

    focusSelectedMarker({
        map: scene.map,
        infoWindow: scene.infoWindow,
        renderedMarkers: scene.renderedMarkers,
        selectedMarkerId,
    });
}

type UpdateRecommendationMapSceneRoutesArgs = {
    scene: RecommendationMapScene;
    routeSegments: RecommendationRouteSegment[];
};

export function updateRecommendationMapSceneRoutes({
    scene,
    routeSegments,
}: UpdateRecommendationMapSceneRoutesArgs) {
    scene.routePolylines.forEach((polyline) => {
        polyline.setMap(null);
    });

    scene.routePolylines = renderRecommendationRouteSegments(scene.map, scene.kakao, routeSegments);
}