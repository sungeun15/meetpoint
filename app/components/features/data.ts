export type FeatureCardItem = {
    icon: string;
    title: string;
    description: string;
};

export const featureCards: FeatureCardItem[] = [
    {
        icon: "📍",
        title: "Location Sharing",
        description:
            "Save your current location only when you choose to share it, keeping the flow manual instead of real-time tracking.",
    },
    {
        icon: "💬",
        title: "Comment-style Chat",
        description:
            "Coordinate plans with a simple chat space that keeps conversations lightweight and easy to follow.",
    },
    {
        icon: "🗺️",
        title: "Midpoint Calculation",
        description:
            "Calculate the midpoint from the average of two coordinates and use it as the starting point for meetup planning.",
    },
    {
        icon: "🎯",
        title: "Fair Place Recommendation",
        description:
            "Rank places around the midpoint with distance and fairness scores, then return the top three meetup options.",
    },
    {
        icon: "👥",
        title: "Easy Friend Addition",
        description:
            "Add friends quickly with a nickname-based flow so you can start chatting and sharing locations faster.",
    },
    {
        icon: "🔗",
        title: "Integrated Experience",
        description:
            "See your location, your friend's location, the midpoint, and recommendation results together in one connected flow.",
    },
];