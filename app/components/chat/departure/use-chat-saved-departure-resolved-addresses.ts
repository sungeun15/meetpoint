import { useEffect, useState } from "react";

import { loadKakaoMapSdk } from "@/lib/kakao/map-loader";

import type { DepartureParty, SavedDeparture } from "../types";

type SavedDepartureResolvedAddressState = Record<string, {
    // 저장된 출발지 위도입니다.
    latitude: number;
    // 저장된 출발지 경도입니다.
    longitude: number;
    // 좌표를 기준으로 해석한 주소 문자열입니다.
    address: string;
}>;

type UseChatSavedDepartureResolvedAddressesArgs = {
    // 화면에 보이는 저장 출발지 목록을 파티별로 넘깁니다.
    visibleSavedDepartures: Record<DepartureParty, SavedDeparture[]>;
};

export function useChatSavedDepartureResolvedAddresses({
    visibleSavedDepartures,
}: UseChatSavedDepartureResolvedAddressesArgs) {
    const [savedDepartureResolvedAddresses, setSavedDepartureResolvedAddresses] = useState<SavedDepartureResolvedAddressState>({});

    useEffect(() => {
        const departures = Object.values(visibleSavedDepartures).flat();
        const unresolvedDepartures = departures.filter((departure) => {
            if (departure.address.trim()) {
                return false;
            }

            const cachedAddress = savedDepartureResolvedAddresses[departure.id];

            return !cachedAddress
                || cachedAddress.latitude !== departure.latitude
                || cachedAddress.longitude !== departure.longitude;
        });

        if (!unresolvedDepartures.length) {
            return;
        }

        let isDisposed = false;

        loadKakaoMapSdk()
            .then((kakao) => {
                if (isDisposed) {
                    return;
                }

                const geocoder = new kakao.maps.services.Geocoder();

                unresolvedDepartures.forEach((departure) => {
                    geocoder.coord2Address(departure.longitude, departure.latitude, (result, status) => {
                        if (isDisposed) {
                            return;
                        }

                        const nextAddress = status === kakao.maps.services.Status.OK && result[0]
                            ? result[0].road_address?.address_name ?? result[0].address?.address_name ?? departure.address
                            : departure.address;

                        setSavedDepartureResolvedAddresses((currentAddresses) => {
                            const currentAddress = currentAddresses[departure.id];

                            if (
                                currentAddress
                                && currentAddress.latitude === departure.latitude
                                && currentAddress.longitude === departure.longitude
                                && currentAddress.address === nextAddress
                            ) {
                                return currentAddresses;
                            }

                            return {
                                ...currentAddresses,
                                [departure.id]: {
                                    latitude: departure.latitude,
                                    longitude: departure.longitude,
                                    address: nextAddress,
                                },
                            };
                        });
                    });
                });
            })
            .catch(() => {
                // 주소 조회 실패 시에는 기존 라벨을 표시하도록 조용히 폴백합니다.
            });

        return () => {
            isDisposed = true;
        };
    }, [savedDepartureResolvedAddresses, visibleSavedDepartures]);

    return {
        savedDepartureResolvedAddresses,
    };
}