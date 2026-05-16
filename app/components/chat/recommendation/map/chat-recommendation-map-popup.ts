import type { MapMarker } from "../../types";
import {
    buildPlaceCategoryIconMarkup,
    resolveInfoWindowToneStyle,
    resolveMarkerTypeLabel,
} from "./chat-recommendation-map-popup-presentation";

// Kakao InfoWindow에 바로 주입할 HTML 문자열을 마커 정보로 조합합니다.
export function buildInfoWindowContent(marker: MapMarker) {
    const toneStyle = resolveInfoWindowToneStyle(marker.markerType);
    // 장소 마커일 때만 카테고리 장식 아이콘을 붙이고, 사람/중심점은 텍스트 위주로 단순하게 표시합니다.
    const placeCategoryIconMarkup = marker.markerType === "place"
        ? buildPlaceCategoryIconMarkup(marker.placeCategory)
        : "";

    return `
        <div style="min-width:220px;max-width:260px;padding:14px 14px 12px;border-radius:18px;border:1px solid rgba(167,139,250,0.22);box-shadow:0 14px 34px rgba(43,35,115,0.16);${toneStyle}">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                <div style="display:flex;align-items:center;gap:8px;min-width:0;">
                    ${placeCategoryIconMarkup}
                    <strong style="font-size:14px;line-height:1.35;word-break:keep-all;">${marker.label}</strong>
                </div>
                <span style="display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:rgba(255,255,255,0.78);padding:4px 8px;font-size:11px;font-weight:700;">${resolveMarkerTypeLabel(marker.markerType)}</span>
            </div>
            <p style="margin:8px 0 0;font-size:12px;line-height:1.55;color:rgba(15,23,42,0.76);">${marker.description}</p>
        </div>
    `;
}

export function buildOverlappingPersonInfoWindowContent(markers: MapMarker[]) {
    return buildOverlappingPersonInfoWindowContentWithMidpoint(markers, false);
}

export function buildOverlappingPersonInfoWindowContentWithMidpoint(
    markers: MapMarker[],
    hasMidpointAtSameLocation: boolean,
) {
    const midpointStarBadgeMarkup = `
        <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:999px;background:#F59E0B;box-shadow:inset 0 1px 0 rgba(255,244,214,0.85);flex-shrink:0;">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M10 2.4L12.05 6.56L16.64 7.22L13.32 10.45L14.1 15L10 12.84L5.9 15L6.68 10.45L3.36 7.22L7.95 6.56L10 2.4Z" fill="white"/>
            </svg>
        </span>
    `;
    const itemsMarkup = markers.map((marker) => `
        <li style="display:flex;flex-direction:column;gap:4px;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,0.74);border:1px solid rgba(148,163,184,0.2);">
            <strong style="font-size:13px;line-height:1.35;color:#0f172a;">${marker.label}</strong>
            <span style="font-size:12px;line-height:1.5;color:rgba(15,23,42,0.76);">${marker.description}</span>
        </li>
    `).join("");
    const midpointNoticeMarkup = hasMidpointAtSameLocation
        ? `<p style="margin:0 0 10px;padding:10px 12px;border-radius:14px;background:rgba(79,70,229,0.08);border:1px solid rgba(99,102,241,0.16);font-size:12px;line-height:1.55;color:rgba(49,46,129,0.92);">중심점도 현재 같은 좌표에 계산되어 이 위치와 동일하게 잡혀 있어요.</p>`
        : "";

    return `
        <div style="min-width:228px;max-width:280px;padding:14px 14px 12px;border-radius:18px;border:1px solid rgba(167,139,250,0.22);box-shadow:0 14px 34px rgba(43,35,115,0.16);background:linear-gradient(180deg, rgba(250,245,255,0.98) 0%, rgba(255,245,249,0.96) 100%);">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                <div style="display:flex;align-items:center;gap:8px;min-width:0;">
                    ${midpointStarBadgeMarkup}
                    <strong style="font-size:14px;line-height:1.35;color:#111827;word-break:keep-all;">같은 위치에서 함께 있어요</strong>
                </div>
                <span style="display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:#111827;color:white;padding:4px 8px;font-size:11px;font-weight:700;">${markers.length}명</span>
            </div>
            <p style="margin:8px 0 10px;font-size:12px;line-height:1.55;color:rgba(15,23,42,0.76);">현재 좌표가 같아서 하나의 겹침 마커로 표시하고 있습니다.</p>
            ${midpointNoticeMarkup}
            <ul style="display:grid;gap:8px;margin:0;padding:0;list-style:none;">${itemsMarkup}</ul>
        </div>
    `;
}