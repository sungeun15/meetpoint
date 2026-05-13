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