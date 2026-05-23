import type { MapMarker } from "../../types";

export type PlaceMarkerPalette = {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    cardBackgroundClassName: string;
    cardBorderClassName: string;
    cardBadgeClassName: string;
    cardCategoryClassName: string;
};

const placeMarkerPalettes: PlaceMarkerPalette[] = [
    { primaryColor: "#F97316", secondaryColor: "#FDBA74", accentColor: "#9A3412", cardBackgroundClassName: "bg-[linear-gradient(135deg,rgba(249,115,22,0.18)_0%,rgba(253,186,116,0.12)_52%,rgba(255,255,255,0.96)_100%)]", cardBorderClassName: "border-[#F97316]/70", cardBadgeClassName: "bg-[#FFF1E8] text-[#9A3412]", cardCategoryClassName: "text-[#C2410C]" },
    { primaryColor: "#EF4444", secondaryColor: "#FCA5A5", accentColor: "#B91C1C", cardBackgroundClassName: "bg-[linear-gradient(135deg,rgba(239,68,68,0.18)_0%,rgba(252,165,165,0.12)_52%,rgba(255,255,255,0.96)_100%)]", cardBorderClassName: "border-[#EF4444]/70", cardBadgeClassName: "bg-[#FFF0F0] text-[#B91C1C]", cardCategoryClassName: "text-[#DC2626]" },
    { primaryColor: "#EC4899", secondaryColor: "#F9A8D4", accentColor: "#BE185D", cardBackgroundClassName: "bg-[linear-gradient(135deg,rgba(236,72,153,0.18)_0%,rgba(249,168,212,0.12)_52%,rgba(255,255,255,0.96)_100%)]", cardBorderClassName: "border-[#EC4899]/70", cardBadgeClassName: "bg-[#FFF0F7] text-[#BE185D]", cardCategoryClassName: "text-[#DB2777]" },
    { primaryColor: "#D946EF", secondaryColor: "#F0ABFC", accentColor: "#A21CAF", cardBackgroundClassName: "bg-[linear-gradient(135deg,rgba(217,70,239,0.18)_0%,rgba(240,171,252,0.12)_52%,rgba(255,255,255,0.96)_100%)]", cardBorderClassName: "border-[#D946EF]/70", cardBadgeClassName: "bg-[#FDF0FF] text-[#A21CAF]", cardCategoryClassName: "text-[#C026D3]" },
    { primaryColor: "#8B5CF6", secondaryColor: "#C4B5FD", accentColor: "#6D28D9", cardBackgroundClassName: "bg-[linear-gradient(135deg,rgba(139,92,246,0.18)_0%,rgba(196,181,253,0.12)_52%,rgba(255,255,255,0.96)_100%)]", cardBorderClassName: "border-[#8B5CF6]/70", cardBadgeClassName: "bg-[#F3F0FF] text-[#6D28D9]", cardCategoryClassName: "text-[#7C3AED]" },
    { primaryColor: "#6366F1", secondaryColor: "#A5B4FC", accentColor: "#4338CA", cardBackgroundClassName: "bg-[linear-gradient(135deg,rgba(99,102,241,0.18)_0%,rgba(165,180,252,0.12)_52%,rgba(255,255,255,0.96)_100%)]", cardBorderClassName: "border-[#6366F1]/70", cardBadgeClassName: "bg-[#EEF2FF] text-[#4338CA]", cardCategoryClassName: "text-[#4F46E5]" },
    { primaryColor: "#3B82F6", secondaryColor: "#93C5FD", accentColor: "#1D4ED8", cardBackgroundClassName: "bg-[linear-gradient(135deg,rgba(59,130,246,0.18)_0%,rgba(147,197,253,0.12)_52%,rgba(255,255,255,0.96)_100%)]", cardBorderClassName: "border-[#3B82F6]/70", cardBadgeClassName: "bg-[#EFF6FF] text-[#1D4ED8]", cardCategoryClassName: "text-[#2563EB]" },
    { primaryColor: "#06B6D4", secondaryColor: "#67E8F9", accentColor: "#0F766E", cardBackgroundClassName: "bg-[linear-gradient(135deg,rgba(6,182,212,0.18)_0%,rgba(103,232,249,0.12)_52%,rgba(255,255,255,0.96)_100%)]", cardBorderClassName: "border-[#06B6D4]/70", cardBadgeClassName: "bg-[#ECFEFF] text-[#0F766E]", cardCategoryClassName: "text-[#0891B2]" },
    { primaryColor: "#14B8A6", secondaryColor: "#99F6E4", accentColor: "#0F766E", cardBackgroundClassName: "bg-[linear-gradient(135deg,rgba(20,184,166,0.18)_0%,rgba(153,246,228,0.12)_52%,rgba(255,255,255,0.96)_100%)]", cardBorderClassName: "border-[#14B8A6]/70", cardBadgeClassName: "bg-[#F0FDFA] text-[#0F766E]", cardCategoryClassName: "text-[#0F766E]" },
    { primaryColor: "#22C55E", secondaryColor: "#86EFAC", accentColor: "#15803D", cardBackgroundClassName: "bg-[linear-gradient(135deg,rgba(34,197,94,0.18)_0%,rgba(134,239,172,0.12)_52%,rgba(255,255,255,0.96)_100%)]", cardBorderClassName: "border-[#22C55E]/70", cardBadgeClassName: "bg-[#F0FDF4] text-[#15803D]", cardCategoryClassName: "text-[#16A34A]" },
];

export function resolvePlaceMarkerPalette(marker: MapMarker) {
    if (typeof marker.rank === "number" && marker.rank > 0) {
        return placeMarkerPalettes[(marker.rank - 1) % placeMarkerPalettes.length];
    }

    const hashValue = marker.id.split("").reduce((accumulator, character) => accumulator + character.charCodeAt(0), 0);

    return placeMarkerPalettes[hashValue % placeMarkerPalettes.length];
}