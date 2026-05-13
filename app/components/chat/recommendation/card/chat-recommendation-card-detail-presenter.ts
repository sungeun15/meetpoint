import type { RecommendationCard } from "../../types";

export type RecommendationCardDetailTabId = "address" | "distance" | "drive";

export type RecommendationCardDetailSection = {
    id: RecommendationCardDetailTabId; // 모바일 탭 전환과 섹션 식별에 사용하는 id입니다.
    tabLabel: string; // 모바일 탭 버튼에 표시할 짧은 라벨입니다.
    label: string; // 본문 상세 박스 상단에 표시할 제목입니다.
    value: string; // 실제로 보여 줄 상세 값입니다.
    toneClassName: string; // 상세 박스 배경 톤을 제어하는 클래스입니다.
    textClassName: string; // 본문 텍스트 색상을 제어하는 클래스입니다.
    accentClassName: string; // 상단 라벨 강조 색상을 제어하는 클래스입니다.
    desktopSpanClassName?: string; // 데스크톱 그리드에서 열 확장을 줄 때 사용하는 클래스입니다.
};

type RecommendationCardDetailStyle = Pick<
    RecommendationCardDetailSection,
    "toneClassName" | "textClassName" | "accentClassName"
>;

// 일반 상세 섹션에서 사용할 기본 색상 조합입니다.
function buildDefaultDetailStyle(isSelected: boolean): RecommendationCardDetailStyle {
    return {
        toneClassName: isSelected ? "bg-white/82" : "bg-[#faf8ff]",
        textClassName: "text-[#4a5568]",
        accentClassName: "text-[#8a7be5]",
    };
}

// 운전 예상 시간 섹션만 따뜻한 강조색으로 분리합니다.
function buildDriveDetailStyle(isSelected: boolean): RecommendationCardDetailStyle {
    return {
        toneClassName: isSelected ? "bg-[linear-gradient(180deg,rgba(255,247,237,0.98)_0%,rgba(255,255,255,0.86)_100%)]" : "bg-[#fff8f1]",
        textClassName: "text-[#6b4f1d]",
        accentClassName: "text-[#d97706]",
    };
}

// 카드 데이터에서 주소/거리/운전 추정 영역을 UI 섹션 배열로 변환합니다.
export function buildRecommendationCardDetailSections(
    recommendationCard: RecommendationCard,
    isSelected: boolean,
): RecommendationCardDetailSection[] {
    const defaultDetailStyle = buildDefaultDetailStyle(isSelected);
    const driveDetailStyle = buildDriveDetailStyle(isSelected);

    return [
        {
            id: "address",
            tabLabel: "주소",
            label: "주소",
            value: recommendationCard.address,
            ...defaultDetailStyle,
        },
        {
            id: "distance",
            tabLabel: "거리",
            label: "직선 거리",
            value: `내 거리 ${recommendationCard.myDistance} · 친구 거리 ${recommendationCard.friendDistance}`,
            ...defaultDetailStyle,
        },
        {
            id: "drive",
            tabLabel: "시간",
            label: "자동차 기준 추정",
            value: `나 ${recommendationCard.myDrivingEstimate} · 친구 ${recommendationCard.friendDrivingEstimate}`,
            ...driveDetailStyle,
            desktopSpanClassName: "sm:col-span-2",
        },
    ];
}