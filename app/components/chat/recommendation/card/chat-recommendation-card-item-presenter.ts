import type { RecommendationCard } from "../../types";

type RecommendationCardBadge = {
    id: "distance" | "score"; // 어떤 종류의 배지인지 구분하는 식별자입니다.
    label: string; // 화면에 그대로 노출할 배지 문구입니다.
    className: string; // 선택 상태에 따라 달라지는 배지 스타일 클래스입니다.
};

type RecommendationCardHeaderContent = {
    title: string; // 순위와 장소명을 합친 카드 제목입니다.
    category: string; // 장소 카테고리 라벨입니다.
    mobileMetaLabel: string; // 모바일 좁은 화면에서 한 줄로 요약해 보여 줄 메타 정보입니다.
    desktopBadges: RecommendationCardBadge[]; // 데스크톱에서 분리 노출할 거리/점수 배지 목록입니다.
};

// 선택 카드 여부에 따라 거리 배지의 톤을 바꿉니다.
function buildDistanceBadgeClassName(isSelected: boolean) {
    return isSelected
        ? "bg-white text-[#5740d5] shadow-[0px_10px_20px_rgba(87,64,213,0.12)]"
        : "bg-[#f3eeff] text-[#6c5ce7]";
}

// 선택 카드 여부에 따라 점수 배지의 톤을 바꿉니다.
function buildScoreBadgeClassName(isSelected: boolean) {
    return isSelected
        ? "bg-[#e6f0ff] text-[#1f56c1] shadow-[0px_10px_20px_rgba(36,85,195,0.12)]"
        : "bg-[#eef6ff] text-[#2455c3]";
}

// 카드 헤더 영역에서 바로 사용할 제목/배지/모바일 요약 문구를 조합합니다.
export function buildRecommendationCardHeaderContent(
    recommendationCard: RecommendationCard,
    isSelected: boolean,
): RecommendationCardHeaderContent {
    return {
        title: `${recommendationCard.rank}. ${recommendationCard.name}`,
        category: recommendationCard.category,
        mobileMetaLabel: `나 ${recommendationCard.myDistance} · 친구 ${recommendationCard.friendDistance} · ${recommendationCard.scoreLabel}`,
        desktopBadges: [
            {
                id: "distance",
                label: `나 ${recommendationCard.myDistance} · 친구 ${recommendationCard.friendDistance}`,
                className: buildDistanceBadgeClassName(isSelected),
            },
            {
                id: "score",
                label: recommendationCard.scoreLabel,
                className: buildScoreBadgeClassName(isSelected),
            },
        ],
    };
}