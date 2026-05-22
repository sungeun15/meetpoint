import { resolveCoordinatesAddress } from "@/lib/kakao/geocoder";

function formatCoordinateAddress(latitude: number, longitude: number) {
    return `위도 ${latitude.toFixed(4)} · 경도 ${longitude.toFixed(4)}`;
}

export function buildCoordinatePreviewAddress(prefix: string, latitude: number, longitude: number) {
    return `${prefix} · ${formatCoordinateAddress(latitude, longitude)}`;
}

type ResolveCoordinateDisplayAddressArgs = {
    latitude: number;
    longitude: number;
    fallbackAddress?: string;
    fallbackPrefix?: string;
};

// 좌표 기반 주소 표시 정책을 한곳에 모아 fallback 생성과 역지오코딩 실패 처리를 통일합니다.
export async function resolveCoordinateDisplayAddress({
    latitude,
    longitude,
    fallbackAddress,
    fallbackPrefix,
}: ResolveCoordinateDisplayAddressArgs) {
    const normalizedFallback = fallbackAddress?.trim()
        || (fallbackPrefix
            ? buildCoordinatePreviewAddress(fallbackPrefix, latitude, longitude)
            : formatCoordinateAddress(latitude, longitude));

    try {
        const resolvedAddress = await resolveCoordinatesAddress(latitude, longitude, normalizedFallback);

        return resolvedAddress.trim() || normalizedFallback;
    } catch {
        return normalizedFallback;
    }
}