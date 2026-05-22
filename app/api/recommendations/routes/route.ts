import { apiError, apiOk } from "@/lib/contracts/api";
import type {
    RecommendationRouteOwner,
    RecommendationRouteRequestBody,
    RecommendationRouteTransportMode,
} from "@/lib/contracts/recommendation-routes";
import { KakaoMobilityApiError } from "@/lib/kakao/mobility";
import { createProtectedRoute } from "@/lib/utils/route-scaffold";
import {
    InputValidationError,
    validateCoordinates,
    validateDepartureLabel,
} from "@/lib/utils/validation";

import { buildCarRecommendationRouteResponse } from "./recommendation-route-car-provider";
import { buildRecommendationFallbackRouteResponse } from "./recommendation-route-fallback";

export const dynamic = "force-dynamic";

const RECOMMENDATION_ROUTE_OWNER_VALUES = ["me", "friend"] as const;
const RECOMMENDATION_ROUTE_MODE_VALUES = ["bus", "car", "bike", "walk"] as const;

type RoutePointInput = {
    label: string;
    latitude: number;
    longitude: number;
};

type RouteOriginInput = RoutePointInput & {
    owner: RecommendationRouteOwner;
};

function validateRouteMode(value: unknown) {
    if (
        typeof value !== "string"
        || !RECOMMENDATION_ROUTE_MODE_VALUES.includes(value as RecommendationRouteTransportMode)
    ) {
        throw new InputValidationError("mode는 bus, car, bike, walk 중 하나여야 합니다.");
    }

    return value as RecommendationRouteTransportMode;
}

function validateRouteOwner(value: unknown, fieldName: string) {
    if (
        typeof value !== "string"
        || !RECOMMENDATION_ROUTE_OWNER_VALUES.includes(value as RecommendationRouteOwner)
    ) {
        throw new InputValidationError(`${fieldName}.owner는 me 또는 friend 이어야 합니다.`);
    }

    return value as RecommendationRouteOwner;
}

function validateRoutePoint(value: unknown, fieldName: string): RoutePointInput {
    if (typeof value !== "object" || value === null) {
        throw new InputValidationError(`${fieldName}는 객체여야 합니다.`);
    }

    const point = value as {
        label?: unknown;
        lat?: unknown;
        lng?: unknown;
    };
    const label = validateDepartureLabel(point.label);
    const { lat, lng } = validateCoordinates(point.lat, point.lng);

    return {
        label,
        latitude: lat,
        longitude: lng,
    };
}

function validateRouteOrigins(value: unknown): RouteOriginInput[] {
    if (!Array.isArray(value) || value.length === 0) {
        throw new InputValidationError("origins는 1개 이상이어야 합니다.");
    }

    return value.map((origin, index) => {
        if (typeof origin !== "object" || origin === null) {
            throw new InputValidationError(`origins[${index}]는 객체여야 합니다.`);
        }

        const input = origin as {
            owner?: unknown;
            label?: unknown;
            lat?: unknown;
            lng?: unknown;
        };
        const owner = validateRouteOwner(input.owner, `origins[${index}]`);
        const point = validateRoutePoint(origin, `origins[${index}]`);

        return {
            owner,
            ...point,
        };
    });
}
async function buildRouteResponse(body: RecommendationRouteRequestBody) {
    const destination = validateRoutePoint(body.destination, "destination");
    const mode = validateRouteMode(body.mode);
    const origins = validateRouteOrigins(body.origins);

    if (mode === "car") {
        return buildCarRecommendationRouteResponse({
            destination,
            origins,
        });
    }

    return buildRecommendationFallbackRouteResponse({
        destination,
        origins,
        mode,
    });
}

export const POST = createProtectedRoute(async (request) => {
    try {
        const body = (await request.json()) as RecommendationRouteRequestBody;

        return apiOk(await buildRouteResponse(body));
    } catch (error) {
        if (error instanceof InputValidationError) {
            return apiError("INVALID_INPUT", error.message, 400);
        }

        if (error instanceof KakaoMobilityApiError) {
            return apiError("KAKAO_MOBILITY_API_FAILED", error.message, 502);
        }

        if (error instanceof SyntaxError) {
            return apiError("INVALID_INPUT", "요청 본문 형식이 올바르지 않습니다.", 400);
        }

        return apiError("INTERNAL_ERROR", "길찾기 경로를 준비하는 중 오류가 발생했습니다.", 500);
    }
});