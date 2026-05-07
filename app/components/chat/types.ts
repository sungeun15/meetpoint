export type ChatMessage = {
    id: string;
    friendId: string;
    sender: "friend" | "me";
    text: string;
    time: string;
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