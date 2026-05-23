import { useEffect, useState } from "react";

import type {
    RecommendationRouteOwner,
    RecommendationRouteRequestBody,
} from "@/lib/contracts/recommendation-routes";

import { requestRecommendationRoute } from "./flow-state/chat-recommendation-route-request";
import type {
    MapMarker,
    RecommendationRouteSegment,
    RecommendationRouteStatus,
    RecommendationTransportMode,
} from "../types";

type UseChatRecommendationRouteStateArgs = {
    mapMarkers: MapMarker[];
    selectedPlaceId: string | null;
    selectedTransportMode: RecommendationTransportMode;
};

export type UseChatRecommendationRouteStateResult = {
    routeStatus: RecommendationRouteStatus;
    routeErrorMessage: string | null;
    routeSegments: RecommendationRouteSegment[];
};

type RecommendationRouteResolvedState = {
    requestKey: string | null;
    routeStatus: Extract<RecommendationRouteStatus, "ready" | "error">;
    routeErrorMessage: string | null;
    routeSegments: RecommendationRouteSegment[];
};

function buildRecommendationRouteRequestBody(
    mapMarkers: MapMarker[],
    selectedPlaceId: string | null,
    selectedTransportMode: RecommendationTransportMode,
): RecommendationRouteRequestBody | null {
    if (!selectedPlaceId || selectedTransportMode !== "car") {
        return null;
    }

    const destination = mapMarkers.find(
        (marker) => marker.id === selectedPlaceId && marker.markerType === "place",
    );

    if (!destination) {
        return null;
    }

    const origins = mapMarkers
        .filter(
            (marker) => marker.markerType === "person" && (marker.id === "me" || marker.id === "friend"),
        )
        .map((marker) => ({
            owner: (marker.id === "me" ? "me" : "friend") as RecommendationRouteOwner,
            label: marker.label,
            lat: marker.latitude,
            lng: marker.longitude,
        }));

    if (origins.length === 0) {
        return null;
    }

    return {
        mode: selectedTransportMode,
        destination: {
            label: destination.label,
            lat: destination.latitude,
            lng: destination.longitude,
        },
        origins,
    };
}

export function useChatRecommendationRouteState({
    mapMarkers,
    selectedPlaceId,
    selectedTransportMode,
}: UseChatRecommendationRouteStateArgs): UseChatRecommendationRouteStateResult {
    const requestBody = buildRecommendationRouteRequestBody(
        mapMarkers,
        selectedPlaceId,
        selectedTransportMode,
    );
    const requestKey = requestBody ? JSON.stringify(requestBody) : null;
    const [resolvedState, setResolvedState] = useState<RecommendationRouteResolvedState>({
        requestKey: null,
        routeStatus: "ready",
        routeErrorMessage: null,
        routeSegments: [],
    });

    useEffect(() => {
        if (!requestKey) {
            return;
        }

        const currentRequestBody = JSON.parse(requestKey) as RecommendationRouteRequestBody;

        const abortController = new AbortController();
        let isActive = true;

        requestRecommendationRoute(currentRequestBody, abortController.signal)
            .then((result) => {
                if (!isActive || result.status === "aborted") {
                    return;
                }

                if (result.status === "ok") {
                    setResolvedState({
                        requestKey,
                        routeStatus: "ready",
                        routeErrorMessage: null,
                        routeSegments: result.data.segments,
                    });
                    return;
                }

                if (result.status === "unauthorized") {
                    setResolvedState({
                        requestKey,
                        routeStatus: "error",
                        routeErrorMessage: "로그인이 만료되어 길찾기 경로를 불러오지 못했어요.",
                        routeSegments: [],
                    });
                    return;
                }

                setResolvedState({
                    requestKey,
                    routeStatus: "error",
                    routeErrorMessage: result.message,
                    routeSegments: [],
                });
            });

        return () => {
            isActive = false;
            abortController.abort();
        };
    }, [requestKey]);

    if (!requestBody || !requestKey) {
        return {
            routeStatus: "idle",
            routeErrorMessage: null,
            routeSegments: [],
        };
    }

    if (resolvedState.requestKey !== requestKey) {
        return {
            routeStatus: "loading",
            routeErrorMessage: null,
            routeSegments: [],
        };
    }

    return {
        routeStatus: resolvedState.routeStatus,
        routeErrorMessage: resolvedState.routeErrorMessage,
        routeSegments: resolvedState.routeSegments,
    };
}
