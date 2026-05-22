import { loadKakaoMapSdk } from "./map-loader";

export type ResolvedKakaoAddress = {
    // 최종 주소 문자열입니다.
    address: string;
    // 검색 결과 위도입니다.
    latitude: number;
    // 검색 결과 경도입니다.
    longitude: number;
};

export function isCoordinateBasedAddress(address: string | null | undefined) {
    // 역지오코딩 전 임시 주소 형식인지 빠르게 판별합니다.
    const normalizedAddress = address?.trim() ?? "";

    if (!normalizedAddress) {
        return false;
    }

    return normalizedAddress.startsWith("좌표 ")
        || normalizedAddress.startsWith("위도 ")
        || normalizedAddress.startsWith("브라우저 현재 위치 · ")
        || normalizedAddress.startsWith("공유한 위치 · ");
}

export async function resolveAddressCoordinates(addressCandidates: string[]) {
    // 같은 후보를 반복 조회하지 않도록 공백 정리 후 중복을 제거합니다.
    const kakao = await loadKakaoMapSdk();
    const uniqueCandidates = [...new Set(addressCandidates.map((candidate) => candidate.trim()).filter(Boolean))];

    for (const candidate of uniqueCandidates) {
        const resolved = await new Promise<ResolvedKakaoAddress | null>((resolve, reject) => {
            const geocoder = new kakao.maps.services.Geocoder();

            geocoder.addressSearch(
                candidate,
                (result, status) => {
                    // 도로명 주소가 있으면 우선 사용하고, 없으면 지번 주소로 보완합니다.
                    if (status === kakao.maps.services.Status.OK && result[0]) {
                        resolve({
                            address: result[0].road_address?.address_name ?? result[0].address?.address_name ?? result[0].address_name,
                            latitude: Number(result[0].y),
                            longitude: Number(result[0].x),
                        });
                        return;
                    }

                    if (status === kakao.maps.services.Status.ZERO_RESULT) {
                        resolve(null);
                        return;
                    }

                    reject(new Error("주소 좌표를 확인하지 못했어요."));
                },
                {
                    size: 1,
                },
            );
        });

        if (resolved) {
            return resolved;
        }
    }

    throw new Error("선택한 주소의 좌표를 정확히 확인하지 못했어요. 다른 주소를 선택해 주세요.");
}

export async function resolveCoordinatesAddress(latitude: number, longitude: number, fallbackAddress = "") {
    const kakao = await loadKakaoMapSdk();

    return await new Promise<string>((resolve, reject) => {
        const geocoder = new kakao.maps.services.Geocoder();

        // coord2Address 는 x=경도, y=위도 순서를 사용하므로 호출 순서를 유지해야 합니다.
        geocoder.coord2Address(longitude, latitude, (result, status) => {
            if (status === kakao.maps.services.Status.OK && result[0]) {
                const resolvedAddress = result[0].road_address?.address_name ?? result[0].address?.address_name;

                resolve(resolvedAddress ?? fallbackAddress);
                return;
            }

            if (status === kakao.maps.services.Status.ZERO_RESULT) {
                resolve(fallbackAddress);
                return;
            }

            reject(new Error("좌표 기준 주소를 확인하지 못했어요."));
        });
    });
}