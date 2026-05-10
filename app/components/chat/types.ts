export type ChatMessage = {
    id: string;
    friendId: string;
    sender: "friend" | "me";
    text: string;
    time: string;
};

export type MeetingMode = "now" | "later";

export type RecommendationCategory = "cafe" | "meal" | "fun";

export type DepartureInputMethod = "search" | "pin" | "saved";

export type SavedDeparture = {
    id: string;
    label: string;
    description: string;
    locationKind: "recent" | "preset";
};

export type RecommendationCard = {
    id: string;
    name: string;
    category: string;
    myDistance: string;
    friendDistance: string;
    summary: string;
    rank: number;
};

export type RecommendationSummary = {
    modeLabel: string;
    categoryLabel: string;
    departureLabel: string;
    midpointLabel: string;
    scoringLabel: string;
};