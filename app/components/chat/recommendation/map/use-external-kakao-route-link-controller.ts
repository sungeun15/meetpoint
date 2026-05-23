import { useEffect, useState } from "react";

import { isCoordinateBasedAddress } from "@/lib/kakao/geocoder";

import { resolveCoordinateDisplayAddress } from "../../chat-coordinate-address-helpers";
import type { MapMarker, RecommendationTransportMode } from "../../types";

type KakaoMapDirectionsLinkArgs = {
    transportMode: RecommendationTransportMode;
    originAddress: string;
    originLatitude: number;
    originLongitude: number;
    destinationAddress: string;
    destinationLatitude: number;
    destinationLongitude: number;
};

type RouteLinkMarker = Pick<MapMarker, "id" | "label" | "address" | "latitude" | "longitude">;

type ResolvedRouteLinkAddressState = Record<string, {
    latitude: number;
    longitude: number;
    address: string;
}>;

type UseExternalKakaoRouteLinkControllerArgs = {
    routeOriginMarkers: MapMarker[];
    selectedPlaceMarker: MapMarker | null;
    selectedTransportMode: RecommendationTransportMode;
};

function buildKakaoMapDirectionsLink({
    transportMode,
    originAddress,
    originLatitude,
    originLongitude,
    destinationAddress,
    destinationLatitude,
    destinationLongitude,
}: KakaoMapDirectionsLinkArgs) {
    const url = new URL("https://map.kakao.com/");

    url.searchParams.set("target", transportMode === "bus" ? "bus" : "car");
    url.searchParams.set(
        "rt",
        [originLongitude, originLatitude, destinationLongitude, destinationLatitude].map((value) => String(value)).join(","),
    );
    url.searchParams.set("rt1", originAddress);
    url.searchParams.set("rt2", destinationAddress);

    return url.toString();
}

function resolveRouteLinkAddress(
    resolvedRouteLinkAddresses: ResolvedRouteLinkAddressState,
    marker: RouteLinkMarker,
) {
    const cachedAddress = resolvedRouteLinkAddresses[marker.id];

    if (
        cachedAddress
        && cachedAddress.latitude === marker.latitude
        && cachedAddress.longitude === marker.longitude
        && cachedAddress.address.trim()
    ) {
        return cachedAddress.address;
    }

    return marker.address ?? marker.label;
}

async function resolveKakaoRouteAddress(
    resolvedRouteLinkAddresses: ResolvedRouteLinkAddressState,
    marker: RouteLinkMarker,
) {
    const cachedAddress = resolveRouteLinkAddress(resolvedRouteLinkAddresses, marker).trim();

    if (cachedAddress && !isCoordinateBasedAddress(cachedAddress)) {
        return cachedAddress;
    }

    return await resolveCoordinateDisplayAddress({
        latitude: marker.latitude,
        longitude: marker.longitude,
        fallbackAddress: cachedAddress || marker.label,
    });
}

function shouldResolveRouteLinkAddress(
    resolvedRouteLinkAddresses: ResolvedRouteLinkAddressState,
    marker: RouteLinkMarker,
) {
    const markerAddress = marker.address?.trim() ?? "";

    if (!isCoordinateBasedAddress(markerAddress)) {
        return false;
    }

    const cachedAddress = resolvedRouteLinkAddresses[marker.id];

    return !cachedAddress
        || cachedAddress.latitude !== marker.latitude
        || cachedAddress.longitude !== marker.longitude
        || !cachedAddress.address.trim()
        || isCoordinateBasedAddress(cachedAddress.address);
}

// 외부 Kakao 길찾기 링크의 주소 보정, 프리패치, 새 창 열기 흐름을 한곳에서 관리합니다.
export function useExternalKakaoRouteLinkController({
    routeOriginMarkers,
    selectedPlaceMarker,
    selectedTransportMode,
}: UseExternalKakaoRouteLinkControllerArgs) {
    const [resolvedRouteLinkAddresses, setResolvedRouteLinkAddresses] = useState<ResolvedRouteLinkAddressState>({});
    const [pendingExternalRouteLinkId, setPendingExternalRouteLinkId] = useState<string | null>(null);
    const shouldShowExternalRouteLinks = selectedPlaceMarker !== null && selectedTransportMode !== "car";

    async function openExternalRouteLink(marker: MapMarker) {
        if (!selectedPlaceMarker || pendingExternalRouteLinkId) {
            return;
        }

        setPendingExternalRouteLinkId(marker.id);

        try {
            const [originAddress, destinationAddress] = await Promise.all([
                resolveKakaoRouteAddress(resolvedRouteLinkAddresses, marker),
                resolveKakaoRouteAddress(resolvedRouteLinkAddresses, selectedPlaceMarker),
            ]);

            window.open(
                buildKakaoMapDirectionsLink({
                    transportMode: selectedTransportMode,
                    originAddress,
                    originLatitude: marker.latitude,
                    originLongitude: marker.longitude,
                    destinationAddress,
                    destinationLatitude: selectedPlaceMarker.latitude,
                    destinationLongitude: selectedPlaceMarker.longitude,
                }),
                "_blank",
                "noopener,noreferrer",
            );
        } finally {
            setPendingExternalRouteLinkId(null);
        }
    }

    useEffect(() => {
        if (!shouldShowExternalRouteLinks || !selectedPlaceMarker) {
            return;
        }

        const markersNeedingResolution = [...routeOriginMarkers, selectedPlaceMarker].filter((marker) => (
            shouldResolveRouteLinkAddress(resolvedRouteLinkAddresses, marker)
        ));

        if (!markersNeedingResolution.length) {
            return;
        }

        let isDisposed = false;

        Promise.all(
            markersNeedingResolution.map(async (marker) => {
                const markerAddress = marker.address?.trim() ?? marker.label;
                const resolvedAddress = await resolveCoordinateDisplayAddress({
                    latitude: marker.latitude,
                    longitude: marker.longitude,
                    fallbackAddress: markerAddress,
                });

                return {
                    id: marker.id,
                    latitude: marker.latitude,
                    longitude: marker.longitude,
                    address: resolvedAddress,
                };
            }),
        ).then((resolvedMarkers) => {
            if (isDisposed) {
                return;
            }

            setResolvedRouteLinkAddresses((currentAddresses) => {
                let hasChanges = false;
                const nextAddresses = { ...currentAddresses };

                resolvedMarkers.forEach((marker) => {
                    const currentAddress = currentAddresses[marker.id];

                    if (
                        currentAddress
                        && currentAddress.latitude === marker.latitude
                        && currentAddress.longitude === marker.longitude
                        && currentAddress.address === marker.address
                    ) {
                        return;
                    }

                    nextAddresses[marker.id] = {
                        latitude: marker.latitude,
                        longitude: marker.longitude,
                        address: marker.address,
                    };
                    hasChanges = true;
                });

                return hasChanges ? nextAddresses : currentAddresses;
            });
        });

        return () => {
            isDisposed = true;
        };
    }, [resolvedRouteLinkAddresses, routeOriginMarkers, selectedPlaceMarker, shouldShowExternalRouteLinks]);

    return {
        pendingExternalRouteLinkId,
        shouldShowExternalRouteLinks,
        openExternalRouteLink,
    };
}