import { loadKakaoMapSdk } from "@/lib/kakao/map-loader";

import type { DepartureParty } from "./types";

type KakaoSdk = Awaited<ReturnType<typeof loadKakaoMapSdk>>;

type PersonMarkerVariant = DepartureParty | "me" | "friend";

function createPersonMarkerSvg(primaryColor: string, accentColor: string) {
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="52" height="64" viewBox="0 0 52 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M26 63C26 63 46 43.5 46 27.5C46 16.1782 37.0457 7 26 7C14.9543 7 6 16.1782 6 27.5C6 43.5 26 63 26 63Z" fill="${primaryColor}"/>
            <circle cx="26" cy="27" r="16" fill="white" fill-opacity="0.96"/>
            <circle cx="26" cy="22" r="5.8" fill="${accentColor}"/>
            <path d="M16.8 34.2C18.9 29.8 22.1 27.6 26 27.6C29.9 27.6 33.1 29.8 35.2 34.2C35.7 35.3 34.9 36.6 33.7 36.6H18.3C17.1 36.6 16.3 35.3 16.8 34.2Z" fill="${accentColor}"/>
            <circle cx="39.5" cy="14.5" r="6.5" fill="#FFF1F2"/>
            <path d="M39.5 11.7V17.3" stroke="${accentColor}" stroke-width="1.8" stroke-linecap="round"/>
            <path d="M36.7 14.5H42.3" stroke="${accentColor}" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
    `)}`;
}

function getPersonMarkerColors(variant: PersonMarkerVariant) {
    return variant === "me"
        ? { primaryColor: "#6675F7", accentColor: "#2B2373" }
        : { primaryColor: "#F97393", accentColor: "#A61B47" };
}

export function createPersonMarkerImage(kakao: KakaoSdk, variant: PersonMarkerVariant) {
    const { primaryColor, accentColor } = getPersonMarkerColors(variant);

    return new kakao.maps.MarkerImage(
        createPersonMarkerSvg(primaryColor, accentColor),
        new kakao.maps.Size(52, 64),
        {
            offset: new kakao.maps.Point(26, 60),
        },
    );
}
