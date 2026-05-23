import type {
    RecommendationRouteOwner,
    RecommendationRouteResponseData,
} from "@/lib/contracts/recommendation-routes";
import { requestKakaoMobilityDirections } from "@/lib/kakao/mobility";

type RecommendationRoutePointInput = {
    label: string;
    latitude: number;
    longitude: number;
};

type RecommendationRouteOriginInput = RecommendationRoutePointInput & {
    owner: RecommendationRouteOwner;
};

function formatDistanceTextFromMeters(distanceMeters: number) {
    if (distanceMeters < 1000) {
        return `${Math.max(50, Math.round(distanceMeters / 10) * 10)}m`;
    }

    const distanceKm = distanceMeters / 1000;

    return `${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)}km`;
}

function formatDurationText(totalMinutes: number) {
    const normalizedMinutes = Math.max(1, Math.round(totalMinutes));

    if (normalizedMinutes < 60) {
        return `${normalizedMinutes}분`;
    }

    const hours = Math.floor(normalizedMinutes / 60);
    const minutes = normalizedMinutes % 60;

    if (minutes === 0) {
        return `${hours}시간`;
    }

    return `${hours}시간 ${minutes}분`;
}

function formatDurationTextFromSeconds(totalSeconds: number) {
    return formatDurationText(totalSeconds / 60);
}

export async function buildCarRecommendationRouteResponse(args: {
    destination: RecommendationRoutePointInput;
    origins: RecommendationRouteOriginInput[];
}): Promise<RecommendationRouteResponseData> {
    const { destination, origins } = args;
    const segments = await Promise.all(origins.map(async (origin) => {
        const direction = await requestKakaoMobilityDirections({
            origin,
            destination,
        });

        return {
            owner: origin.owner,
            mode: "car" as const,
            durationText: formatDurationTextFromSeconds(direction.durationSeconds),
            distanceText: formatDistanceTextFromMeters(direction.distanceMeters),
            path: direction.path,
        };
    }));

    return {
        mode: "car",
        segments,
    };
}