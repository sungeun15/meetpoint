export type ChatMessage = {
    id: string;
    friendId: string;
    sender: "friend" | "me";
    text: string;
    time: string;
    readAt: string | null;
    createdAt: string;
};

export type MeetingMode = "now" | "later";

export type RecommendationCategory = "cafe" | "meal" | "fun";

export type DepartureParty = "me" | "friend";

export type DepartureInputMethod = "search" | "pin" | "saved";

export type SavedDeparture = {
    id: string;
    label: string;
    address: string;
    description: string;
    lastUsedAt?: string;
    locationKind: "recent" | "preset";
    latitude: number;
    longitude: number;
};

export type LocationPoint = {
    latitude: number;
    longitude: number;
};

export type ResolvedLocation = LocationPoint & {
    address: string;
    label: string;
};

export type MapMarker = LocationPoint & {
    id: string;
    label: string;
    description: string;
    placeCategory?: string;
    markerType: "person" | "place" | "midpoint";
};

export type RecommendationCard = {
    id: string;
    name: string;
    category: string;
    address: string;
    myDistance: string;
    friendDistance: string;
    myDrivingEstimate: string;
    friendDrivingEstimate: string;
    rank: number;
    latitude: number;
    longitude: number;
    scoreLabel: string;
};

export type RecommendationSummary = {
    modeLabel: string;
    categoryLabel: string;
    departureLabel: string;
    midpointLabel: string;
    scoringLabel: string;
};

export type RecommendationSnapshot = {
    summary: RecommendationSummary;
    cards: RecommendationCard[];
    markers: MapMarker[];
};