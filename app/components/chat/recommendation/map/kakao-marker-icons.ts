import { loadKakaoMapSdk } from "@/lib/kakao/map-loader";

import type { DepartureParty, MapMarker } from "../../types";

// Kakao SDK 타입을 marker image 생성 함수에서 재사용하기 위한 별칭입니다.
type KakaoSdk = Awaited<ReturnType<typeof loadKakaoMapSdk>>;

type PersonMarkerVariant = DepartureParty | "me" | "friend";

// 추천 장소 마커마다 순환 적용할 색상 팔레트 모음입니다.
const placeMarkerPalettes = [
    { primaryColor: "#FF8A65", secondaryColor: "#FFB199", accentColor: "#9A3412" },
    { primaryColor: "#5B8CFF", secondaryColor: "#A5C8FF", accentColor: "#1D4ED8" },
    { primaryColor: "#8B5CF6", secondaryColor: "#C4B5FD", accentColor: "#6D28D9" },
    { primaryColor: "#10B981", secondaryColor: "#86EFAC", accentColor: "#047857" },
    { primaryColor: "#F59E0B", secondaryColor: "#FCD34D", accentColor: "#B45309" },
    { primaryColor: "#EC4899", secondaryColor: "#F9A8D4", accentColor: "#BE185D" },
];

// 사람 위치 마커용 SVG data URL을 생성합니다.
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

// 중심점 전용 마커 SVG를 생성합니다.
function createMidpointMarkerSvg() {
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="64" height="72" viewBox="0 0 64 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter id="midpointShadow" x="5" y="9" width="54" height="58" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#D97706" flood-opacity="0.28"/>
                </filter>
            </defs>
            <path d="M32 71C32 71 50 53.4 50 39.1C50 28.6 42 20 32 20C22 20 14 28.6 14 39.1C14 53.4 32 71 32 71Z" fill="#F59E0B"/>
            <g filter="url(#midpointShadow)">
                <circle cx="32" cy="34" r="19" fill="#FDBA3B"/>
                <circle cx="32" cy="34" r="16.5" fill="#F59E0B" stroke="#FFF4D6" stroke-width="2.5"/>
                <path d="M32 23.8L34.85 29.58L41.23 30.51L36.62 35L37.71 41.35L32 38.35L26.29 41.35L27.38 35L22.77 30.51L29.15 29.58L32 23.8Z" fill="white"/>
            </g>
        </svg>
    `)}`;
}

// 마커 id를 기반으로 일정한 색상 팔레트가 선택되도록 간단한 해시를 계산합니다.
function hashMarkerId(value: string) {
    return value.split("").reduce((accumulator, character) => accumulator + character.charCodeAt(0), 0);
}

// 장소 마커마다 고정된 색 조합이 나오도록 팔레트를 선택합니다.
function getPlaceMarkerPalette(markerId: string) {
    return placeMarkerPalettes[hashMarkerId(markerId) % placeMarkerPalettes.length];
}

// 마커 id 끝 숫자를 우선 사용하고, 없으면 이름 첫 글자를 뱃지로 사용합니다.
function extractMarkerBadge(marker: MapMarker) {
    const rankMatch = marker.id.match(/(\d+)$/);

    if (rankMatch) {
        return rankMatch[1];
    }

    return marker.label.slice(0, 1).toUpperCase();
}

// 장소 이름에서 대표 한 글자를 뽑아 아이콘 중앙 모노그램으로 사용합니다.
function extractMarkerMonogram(marker: MapMarker) {
    const compactLabel = marker.label.replace(/\s+/g, "").trim();

    return compactLabel.slice(0, 1) || "P";
}

// 추천 장소 전용 SVG 마커를 생성합니다.
function createPlaceMarkerSvg(marker: MapMarker) {
    const { primaryColor, secondaryColor, accentColor } = getPlaceMarkerPalette(marker.id);
    const badgeLabel = extractMarkerBadge(marker);
    const monogram = extractMarkerMonogram(marker);

    // 순위 뱃지와 모노그램을 함께 넣어 작은 마커에서도 장소 식별이 가능하게 만듭니다.
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="62" height="76" viewBox="0 0 62 76" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="placeGradient-${badgeLabel}" x1="11" y1="12" x2="51" y2="60" gradientUnits="userSpaceOnUse">
                    <stop stop-color="${secondaryColor}"/>
                    <stop offset="1" stop-color="${primaryColor}"/>
                </linearGradient>
                <filter id="placeShadow-${badgeLabel}" x="2" y="8" width="58" height="64" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="${accentColor}" flood-opacity="0.24"/>
                </filter>
            </defs>
            <path d="M31 75C31 75 50 56.7 50 41.8C50 29.2 41.5 19 31 19C20.5 19 12 29.2 12 41.8C12 56.7 31 75 31 75Z" fill="${primaryColor}" fill-opacity="0.9"/>
            <g filter="url(#placeShadow-${badgeLabel})">
                <rect x="10" y="12" width="42" height="46" rx="18" fill="url(#placeGradient-${badgeLabel})"/>
                <rect x="14" y="16" width="34" height="30" rx="13" fill="white" fill-opacity="0.94"/>
                <circle cx="31" cy="31" r="9.5" fill="${primaryColor}" fill-opacity="0.18"/>
                <path d="M22 49C24.9 44.8 27.9 42.9 31 42.9C34.1 42.9 37.1 44.8 40 49" stroke="white" stroke-width="2.4" stroke-linecap="round"/>
                <text x="31" y="35.5" text-anchor="middle" font-size="12" font-weight="800" fill="${accentColor}" font-family="Arial, sans-serif">${monogram}</text>
                <rect x="38" y="9" width="16" height="16" rx="8" fill="${accentColor}"/>
                <text x="46" y="20.2" text-anchor="middle" font-size="9" font-weight="800" fill="white" font-family="Arial, sans-serif">${badgeLabel}</text>
            </g>
        </svg>
    `)}`;
}

// 내 위치/친구 위치에 따라 다른 색 조합을 반환합니다.
function getPersonMarkerColors(variant: PersonMarkerVariant) {
    return variant === "me"
        ? { primaryColor: "#6675F7", accentColor: "#2B2373" }
        : { primaryColor: "#F97393", accentColor: "#A61B47" };
}

// 사람 위치용 MarkerImage를 생성합니다.
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

// 중심점용 MarkerImage를 생성합니다.
export function createMidpointMarkerImage(kakao: KakaoSdk) {
    return new kakao.maps.MarkerImage(
        createMidpointMarkerSvg(),
        new kakao.maps.Size(64, 72),
        {
            offset: new kakao.maps.Point(32, 68),
        },
    );
}

// 추천 장소용 MarkerImage를 생성합니다.
export function createPlaceMarkerImage(kakao: KakaoSdk, marker: MapMarker) {
    return new kakao.maps.MarkerImage(
        createPlaceMarkerSvg(marker),
        new kakao.maps.Size(62, 76),
        {
            offset: new kakao.maps.Point(31, 72),
        },
    );
}
