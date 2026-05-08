export type FeatureCardItem = {
    icon: string;
    title: string;
    description: string;
};

export const featureCards: FeatureCardItem[] = [
    {
        icon: "📍",
        title: "Now or Later Mode",
        description:
            "Choose between a spontaneous meetup with current locations or a later plan with selected departure points.",
    },
    {
        icon: "🧭",
        title: "Departure Point Selection",
        description:
            "In later mode, set a starting point with address search, map pin placement, or a saved departure location.",
    },
    {
        icon: "💬",
        title: "Comment-style Chat",
        description:
            "Keep the meetup conversation lightweight with a simple chat flow tied directly to the selected friend.",
    },
    {
        icon: "🎯",
        title: "Category-based Recommendation",
        description:
            "Request cafe, meal, or fun recommendations so the result fits the purpose of the meetup instead of distance alone.",
    },
    {
        icon: "⚖️",
        title: "Fair Scoring Logic",
        description:
            "Rank places with distance balance, category fit, and area vitality to surface options that feel fair and realistic.",
    },
    {
        icon: "🗺️",
        title: "Map and Summary Feedback",
        description:
            "Review shared locations, the midpoint, recommendation cards, and the active planning criteria in one connected screen.",
    },
];