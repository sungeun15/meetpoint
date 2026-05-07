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
            "All essential features like chat, location sharing, and recommendations are connected in one simple flow.",
    },
    {
        icon: "⚖️",
        title: "Fairness",
        description:
            "Meeting points and place suggestions are designed to feel balanced for both people, not just convenient for one side.",
    },
    {
        icon: "✨",
        title: "Simplicity",
        description:
            "The product focuses on a lightweight flow so users can start coordinating quickly without unnecessary steps.",
    },
    {
        icon: "🎯",
        title: "Clarity",
        description:
            "Users can easily understand the planning flow from location sharing to recommendation results.",
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