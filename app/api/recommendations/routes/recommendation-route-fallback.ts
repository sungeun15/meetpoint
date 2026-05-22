import type {
    RecommendationRouteOwner,
    RecommendationRoutePathPoint,
    RecommendationRouteResponseData,
    RecommendationRouteTransportMode,
} from "@/lib/contracts/recommendation-routes";

type RecommendationRoutePointInput = {
    label: string;
    latitude: number;
    longitude: number;
};

type RecommendationRouteOriginInput = RecommendationRoutePointInput & {
    owner: RecommendationRouteOwner;
};

const ROUTE_CURVE_RATIO_BY_MODE: Record<RecommendationRouteTransportMode, number> = {
    bus: 0.22,
    car: 0.14,
    bike: 0.1,
    walk: 0.07,
};

const ROUTE_SPEED_KMH_BY_MODE: Record<RecommendationRouteTransportMode, number> = {
    bus: 22,
    car: 32,
    bike: 14,
    walk: 4.5,
};

function toRadians(value: number) {
    return (value * Math.PI) / 180;
}

function calculateDistanceKm(start: RecommendationRoutePointInput, end: RecommendationRoutePointInput) {
    const earthRadiusKm = 6371;
    const latitudeDelta = toRadians(end.latitude - start.latitude);
    const longitudeDelta = toRadians(end.longitude - start.longitude);
    const startLatitude = toRadians(start.latitude);
    const endLatitude = toRadians(end.latitude);
    const halfChord = Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2)
        + Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) * Math.sin(longitudeDelta / 2);

    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(halfChord), Math.sqrt(1 - halfChord));
}

function formatDistanceText(distanceKm: number) {
    if (distanceKm < 1) {
        return `${Math.max(50, Math.round(distanceKm * 1000 / 10) * 10)}m`;
    }

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

function estimateDurationMinutes(distanceKm: number, mode: RecommendationRouteTransportMode) {
    const baseMinutes = (distanceKm / ROUTE_SPEED_KMH_BY_MODE[mode]) * 60;

    if (mode === "bus") {
        return baseMinutes + 6;
    }

    return baseMinutes;
}

function buildRoutePath(
    origin: RecommendationRouteOriginInput,
    destination: RecommendationRoutePointInput,
    mode: RecommendationRouteTransportMode,
): RecommendationRoutePathPoint[] {
    const latitudeDelta = destination.latitude - origin.latitude;
    const longitudeDelta = destination.longitude - origin.longitude;
    const straightDistance = Math.hypot(latitudeDelta, longitudeDelta);

    if (straightDistance === 0) {
        return [
            {
                latitude: origin.latitude,
                longitude: origin.longitude,
            },
            {
                latitude: destination.latitude,
                longitude: destination.longitude,
            },
        ];
    }

    const midpointLatitude = (origin.latitude + destination.latitude) / 2;
    const midpointLongitude = (origin.longitude + destination.longitude) / 2;
    const normalizedPerpendicularLatitude = -longitudeDelta / straightDistance;
    const normalizedPerpendicularLongitude = latitudeDelta / straightDistance;
    const curveDirection = origin.owner === "me" ? -1 : 1;
    const curveOffset = Math.min(
        Math.max(straightDistance * ROUTE_CURVE_RATIO_BY_MODE[mode], 0.0012),
        0.008,
    ) * curveDirection;
    const controlLatitude = midpointLatitude + normalizedPerpendicularLatitude * curveOffset;
    const controlLongitude = midpointLongitude + normalizedPerpendicularLongitude * curveOffset;

    return [0, 0.22, 0.5, 0.78, 1].map((t) => {
        const inverseT = 1 - t;
        const latitude = inverseT * inverseT * origin.latitude
            + 2 * inverseT * t * controlLatitude
            + t * t * destination.latitude;
        const longitude = inverseT * inverseT * origin.longitude
            + 2 * inverseT * t * controlLongitude
            + t * t * destination.longitude;

        return {
            latitude,
            longitude,
        };
    });
}

export function buildRecommendationFallbackRouteResponse(args: {
    destination: RecommendationRoutePointInput;
    origins: RecommendationRouteOriginInput[];
    mode: Exclude<RecommendationRouteTransportMode, "car">;
}): RecommendationRouteResponseData {
    const { destination, origins, mode } = args;
    const segments = origins.map((origin) => {
        const distanceKm = calculateDistanceKm(origin, destination);

        return {
            owner: origin.owner,
            mode,
            durationText: formatDurationText(estimateDurationMinutes(distanceKm, mode)),
            distanceText: formatDistanceText(distanceKm),
            path: buildRoutePath(origin, destination, mode),
        };
    });

    return {
        mode,
        segments,
    };
}