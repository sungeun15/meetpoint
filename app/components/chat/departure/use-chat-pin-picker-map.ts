import type { MutableRefObject } from "react";
import { useEffect, useRef, useState } from "react";

import type { KakaoMapInstance, KakaoMarkerInstance } from "@/lib/kakao/map-loader";
import { loadKakaoMapSdk } from "@/lib/kakao/map-loader";
import { createPersonMarkerImage } from "../recommendation/map/kakao-marker-icons";
import type { DepartureParty, ResolvedLocation } from "../types";

export type PendingPinSelection = {
    // 현재 선택된 위치의 주소입니다.
    address: string;
    // 현재 선택된 위치의 위도입니다.
    latitude: number;
    // 현재 선택된 위치의 경도입니다.
    longitude: number;
};

export type PinSearchResult = {
    // 검색 결과 항목의 고유 키입니다.
    id: string;
    // 검색 결과 주소 문자열입니다.
    address: string;
    // 검색 결과 위도입니다.
    latitude: number;
    // 검색 결과 경도입니다.
    longitude: number;
};

type PinMapObjects = {
    // 로드된 카카오 SDK 객체입니다.
    sdk: Awaited<ReturnType<typeof loadKakaoMapSdk>>;
    // 실제 지도 인스턴스입니다.
    map: KakaoMapInstance;
    // 선택 위치를 표시할 마커 인스턴스입니다.
    marker: KakaoMarkerInstance;
    // 주소 검색과 역지오코딩을 담당하는 geocoder입니다.
    geocoder: {
        addressSearch: (
            addr: string,
            callback: (result: Array<{ address_name: string; x: string; y: string }>, status: string) => void,
            options?: {
                page?: number;
                size?: number;
                analyze_type?: string;
            },
        ) => void;
        coord2Address: (
            x: number,
            y: number,
            callback: (
                result: Array<{
                    address?: { address_name: string };
                    road_address?: { address_name: string };
                }>,
                status: string,
            ) => void,
        ) => void;
    };
};

type SearchAddressResult =
    | {
        // 검색이 성공했음을 나타냅니다.
        status: "ok";
        // 화면에 노출할 검색 결과 목록입니다.
        results: PinSearchResult[];
    }
    | {
        // 검색이 실패했음을 나타냅니다.
        status: "error";
        // 사용자에게 보여줄 오류 문구입니다.
        message: string;
    };

type UseChatPinPickerMapArgs = {
    // 내 출발지인지 친구 출발지인지 나타냅니다.
    party: DepartureParty;
    // 수정 모드에서 처음 로드할 위치값입니다.
    initialLocation: ResolvedLocation | null;
    // 주소 검색 결과 최대 노출 개수입니다.
    searchResultLimit: number;
    // 사용자가 검색창에 직접 상호작용했는지 추적하는 ref입니다.
    hasUserInteractedWithSearchRef: MutableRefObject<boolean>;
    // 초기 위치를 검색창 문자열로 동기화할 때 호출합니다.
    onSearchQueryHydrated: (nextAddress: string) => void;
    // 검색/선택 상태 안내 문구를 바꿀 때 호출합니다.
    onSearchFeedbackChange: (message: string) => void;
};

export function useChatPinPickerMap({
    party,
    initialLocation,
    searchResultLimit,
    hasUserInteractedWithSearchRef,
    onSearchQueryHydrated,
    onSearchFeedbackChange,
}: UseChatPinPickerMapArgs) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapObjectsRef = useRef<PinMapObjects | null>(null);
    const [mapErrorMessage, setMapErrorMessage] = useState<string | null>(null);
    const [pendingSelection, setPendingSelection] = useState<PendingPinSelection | null>(null);
    const initialLatitude = initialLocation?.latitude ?? null;
    const initialLongitude = initialLocation?.longitude ?? null;
    const initialAddress = initialLocation?.address ?? null;

    function applyPendingSelection(address: string, latitude: number, longitude: number) {
        const mapObjects = mapObjectsRef.current;

        if (!mapObjects) {
            return;
        }

        const nextPosition = new mapObjects.sdk.maps.LatLng(latitude, longitude);
        mapObjects.map.setCenter(nextPosition);
        mapObjects.map.setLevel(3);
        mapObjects.marker.setPosition(nextPosition);
        mapObjects.marker.setMap(mapObjects.map);

        setMapErrorMessage(null);
        setPendingSelection({
            address,
            latitude,
            longitude,
        });
    }

    function clearPendingSelection() {
        setPendingSelection(null);
    }

    function handleSearchResultSelect(result: PinSearchResult) {
        applyPendingSelection(result.address, result.latitude, result.longitude);
        onSearchFeedbackChange("검색 결과를 선택했어요. 아래에서 위치를 확인해 주세요.");
    }

    async function searchAddress(normalizedQuery: string): Promise<SearchAddressResult> {
        const mapObjects = mapObjectsRef.current;

        if (!mapObjects) {
            return {
                status: "error",
                message: "지도를 아직 준비 중이에요. 잠시 후 다시 시도해 주세요.",
            };
        }

        return new Promise((resolve) => {
            mapObjects.geocoder.addressSearch(
                normalizedQuery,
                (result, status) => {
                    if (status !== mapObjects.sdk.maps.services.Status.OK || result.length === 0) {
                        resolve({
                            status: "error",
                            message: "검색 결과가 없어요. 다른 주소나 건물명으로 다시 검색해 주세요.",
                        });
                        return;
                    }

                    resolve({
                        status: "ok",
                        results: result.slice(0, searchResultLimit).map((item, index) => ({
                            id: `${item.address_name}-${index}`,
                            address: item.address_name,
                            latitude: Number(item.y),
                            longitude: Number(item.x),
                        })),
                    });
                },
                {
                    size: searchResultLimit,
                },
            );
        });
    }

    useEffect(() => {
        const container = mapContainerRef.current;

        if (!container) {
            return;
        }

        let isDisposed = false;

        async function setupMap() {
            try {
                const kakao = await loadKakaoMapSdk();

                if (isDisposed || !mapContainerRef.current) {
                    return;
                }

                const center = new kakao.maps.LatLng(37.5665, 126.978);
                const map = new kakao.maps.Map(mapContainerRef.current, {
                    center,
                    level: 4,
                });
                const zoomControl = new kakao.maps.ZoomControl();
                map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
                const marker = new kakao.maps.Marker({
                    map,
                    position: center,
                    image: createPersonMarkerImage(kakao, party),
                });
                marker.setMap(null);

                const geocoder = new kakao.maps.services.Geocoder();
                mapObjectsRef.current = {
                    sdk: kakao,
                    map,
                    marker,
                    geocoder,
                };

                kakao.maps.event.addListener(map, "click", (mouseEvent) => {
                    const clickedPosition = mouseEvent.latLng;
                    const latitude = clickedPosition.getLat();
                    const longitude = clickedPosition.getLng();

                    geocoder.coord2Address(longitude, latitude, (result, status) => {
                        if (isDisposed) {
                            return;
                        }

                        if (status !== kakao.maps.services.Status.OK || !result[0]) {
                            setMapErrorMessage("해당 위치의 주소를 불러오지 못했어요. 다른 지점을 선택해 주세요.");
                            setPendingSelection(null);
                            return;
                        }

                        const resolvedAddress = result[0].road_address?.address_name ?? result[0].address?.address_name;

                        if (!resolvedAddress) {
                            setMapErrorMessage("해당 위치의 주소를 확인하지 못했어요. 다른 지점을 선택해 주세요.");
                            setPendingSelection(null);
                            return;
                        }

                        applyPendingSelection(resolvedAddress, latitude, longitude);
                        onSearchFeedbackChange("지도에서 위치를 선택했어요. 아래에서 확인해 주세요.");
                    });
                });

                if (initialLatitude !== null && initialLongitude !== null) {
                    const initialPosition = new kakao.maps.LatLng(initialLatitude, initialLongitude);
                    map.setCenter(initialPosition);
                    map.setLevel(3);
                    marker.setPosition(initialPosition);
                    marker.setMap(map);

                    geocoder.coord2Address(initialLongitude, initialLatitude, (result, status) => {
                        if (isDisposed) {
                            return;
                        }

                        const resolvedAddress = status === kakao.maps.services.Status.OK && result[0]
                            ? result[0].road_address?.address_name ?? result[0].address?.address_name ?? initialAddress ?? ""
                            : initialAddress ?? "";

                        if (hasUserInteractedWithSearchRef.current) {
                            return;
                        }

                        applyPendingSelection(resolvedAddress, initialLatitude, initialLongitude);
                        onSearchQueryHydrated(resolvedAddress);
                        onSearchFeedbackChange("현재 저장된 위치를 불러왔어요. 주소를 검색하거나 지도를 눌러 다시 지정해 주세요.");
                    });
                }
            } catch (error) {
                if (!isDisposed) {
                    setMapErrorMessage(error instanceof Error ? error.message : "지도를 불러오지 못했어요.");
                }
            }
        }

        void setupMap();

        return () => {
            isDisposed = true;
            mapObjectsRef.current = null;
        };
    }, [hasUserInteractedWithSearchRef, initialAddress, initialLatitude, initialLongitude, onSearchFeedbackChange, onSearchQueryHydrated, party, searchResultLimit]);

    return {
        mapContainerRef,
        mapErrorMessage,
        pendingSelection,
        clearPendingSelection,
        handleSearchResultSelect,
        searchAddress,
    };
}