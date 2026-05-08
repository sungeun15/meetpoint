export type AboutValue = {
    icon: string;
    title: string;
    description: string;
};

export type AboutStackGroup = {
    title: string;
    description: string;
};

export const aboutValues: AboutValue[] = [
    {
        icon: "🔗",
        title: "Integration",
        description:
            "Chat, current location sharing, departure selection, and recommendation feedback are connected in one simple flow.",
    },
    {
        icon: "⚖️",
        title: "Fairness",
        description:
            "Recommendations are designed to feel balanced for both people, not just convenient for one side.",
    },
    {
        icon: "🧭",
        title: "Flexibility",
        description:
            "Users can plan a spontaneous meetup with current positions or prepare a later meetup with chosen departure points.",
    },
    {
        icon: "✨",
        title: "Simplicity",
        description:
            "The product keeps the core planning flow lightweight so users can coordinate quickly without unnecessary steps.",
    },
    {
        icon: "🧩",
        title: "Practicality",
        description:
            "Recommendations are shaped to feel usable in real meetup situations, not just mathematically centered on the map.",
    },
    {
        icon: "🎯",
        title: "Clarity",
        description:
            "Users can easily understand the active mode, category, and recommendation basis from input to result.",
    },
];

export const aboutStackGroups: AboutStackGroup[] = [
    {
        title: "Frontend",
        description: "Next.js, React, Tailwind CSS",
    },
    {
        title: "Backend & Database",
        description: "Next.js Route Handlers, Supabase",
    },
    {
        title: "Maps & Location",
        description: "Kakao Map API, Kakao Local API",
    },
    {
        title: "Collaboration",
        description: "GitHub, Jira",
    },
];