import { loadKakaoMapSdk } from "./map-loader";

export type ResolvedKakaoAddress = {
    address: string;
    latitude: number;
    longitude: number;
};

export async function resolveAddressCoordinates(addressCandidates: string[]) {
    const kakao = await loadKakaoMapSdk();
    const uniqueCandidates = [...new Set(addressCandidates.map((candidate) => candidate.trim()).filter(Boolean))];

    for (const candidate of uniqueCandidates) {
        const resolved = await new Promise<ResolvedKakaoAddress | null>((resolve, reject) => {
            const geocoder = new kakao.maps.services.Geocoder();

            geocoder.addressSearch(
                candidate,
                (result, status) => {
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