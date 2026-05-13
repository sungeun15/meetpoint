import type { MapMarker } from "../../types";

type PlaceCategoryDecoration = {
    emoji: string; // 카테고리를 직관적으로 보여 줄 이모지입니다.
    background: string; // 배지 배경에 사용할 그라데이션 값입니다.
};

// 장소 카테고리에 맞는 아이콘 스타일을 선택합니다.
function resolvePlaceCategoryDecoration(placeCategory: string | undefined): PlaceCategoryDecoration {
    const normalizedCategory = placeCategory?.replace(/\s+/g, "") ?? "";

    if (["카페", "브런치", "스페셜티카페"].includes(normalizedCategory)) {
        return {
            emoji: "☕",
            background: "linear-gradient(135deg,#fff1e6 0%,#fde3cf 100%)",
        };
    }

    if (["식사", "양식", "한식", "복합식당"].includes(normalizedCategory)) {
        return {
            emoji: "🍚",
            background: "linear-gradient(135deg,#fff4df 0%,#ffe2b3 100%)",
        };
    }

    return {
        emoji: "🎲",
        background: "linear-gradient(135deg,#f0e9ff 0%,#ddd0ff 100%)",
    };
}

// 장소 카테고리 아이콘용 인라인 HTML 마크업을 생성합니다.
export function buildPlaceCategoryIconMarkup(placeCategory: string | undefined) {
    const decoration = resolvePlaceCategoryDecoration(placeCategory);

    return `
        <span style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:10px;background:${decoration.background};box-shadow:inset 0 1px 0 rgba(255,255,255,0.72);font-size:17px;line-height:1;flex-shrink:0;">
            ${decoration.emoji}
        </span>
    `;
}

// 마커 종류에 따라 InfoWindow의 톤 스타일을 다르게 적용합니다.
export function resolveInfoWindowToneStyle(markerType: MapMarker["markerType"]) {
    // 사람, 중심점, 장소를 색상만으로도 구분할 수 있게 톤 팔레트를 나눕니다.
    if (markerType === "person") {
        return "background:linear-gradient(135deg,#eef2ff 0%,#fdf2f8 100%);color:#312e81;";
    }

    if (markerType === "midpoint") {
        return "background:linear-gradient(135deg,#ecfeff 0%,#eef2ff 100%);color:#0f172a;";
    }

    return "background:linear-gradient(135deg,#fff7ed 0%,#fef2f2 100%);color:#7c2d12;";
}

// 마커 종류를 사람이 읽는 짧은 라벨로 변환합니다.
export function resolveMarkerTypeLabel(markerType: MapMarker["markerType"]) {
    if (markerType === "person") {
        return "인물";
    }

    if (markerType === "midpoint") {
        return "중심점";
    }

    return "장소";
}