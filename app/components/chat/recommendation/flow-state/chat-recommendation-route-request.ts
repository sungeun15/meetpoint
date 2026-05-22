import type { ApiResponse } from "@/lib/contracts/api";
import type {
    RecommendationRouteRequestBody,
    RecommendationRouteResponseData,
} from "@/lib/contracts/recommendation-routes";

export type RequestRecommendationRouteResult =
    | { status: "ok"; data: RecommendationRouteResponseData }
    | { status: "unauthorized" }
    | { status: "aborted" }
    | { status: "error"; message: string };

function isAbortError(error: unknown) {
    return error instanceof Error && error.name === "AbortError";
}

export async function requestRecommendationRoute(
    body: RecommendationRouteRequestBody,
    signal?: AbortSignal,
): Promise<RequestRecommendationRouteResult> {
    try {
        const response = await fetch("/api/recommendations/routes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
            signal,
        });
        const payload = (await response.json()) as ApiResponse<RecommendationRouteResponseData>;

        if (response.status === 401) {
            return { status: "unauthorized" };
        }

        if (!response.ok || !payload.ok) {
            return {
                status: "error",
                message: payload.ok ? "길찾기 경로를 불러오지 못했어요." : payload.error.message,
            };
        }

        return {
            status: "ok",
            data: payload.data,
        };
    } catch (error) {
        if (isAbortError(error)) {
            return { status: "aborted" };
        }

        return {
            status: "error",
            message: "길찾기 경로를 불러오지 못했어요.",
        };
    }
}
