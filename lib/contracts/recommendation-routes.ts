export type RecommendationRouteTransportMode = "bus" | "car" | "bike" | "walk";

export type RecommendationRouteOwner = "me" | "friend";

export type RecommendationRoutePathPoint = {
    latitude: number;
    longitude: number;
};

export type RecommendationRouteSegment = {
    owner: RecommendationRouteOwner;
    mode: RecommendationRouteTransportMode;
    durationText: string | null;
    distanceText: string | null;
    path: RecommendationRoutePathPoint[];
};

export type RecommendationRouteRequestPoint = {
    label: string;
    lat: number;
    lng: number;
};

export type RecommendationRouteRequestOrigin = RecommendationRouteRequestPoint & {
    owner: RecommendationRouteOwner;
};

export type RecommendationRouteRequestBody = {
    mode: RecommendationRouteTransportMode;
    destination: RecommendationRouteRequestPoint;
    origins: RecommendationRouteRequestOrigin[];
};

export type RecommendationRouteResponseData = {
    mode: RecommendationRouteTransportMode;
    segments: RecommendationRouteSegment[];
};
