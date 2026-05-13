import { friendsBodyFont } from "../../friends/fonts";

type RecommendationModeBadgeProps = {
    modeLabel: string; // 지금 만나기/나중에 만나기처럼 현재 추천 모드를 나타내는 라벨입니다.
};

// 추천 요약 카드와 결과 패널에서 공통으로 쓰는 모드 배지입니다.
export function RecommendationModeBadge({ modeLabel }: RecommendationModeBadgeProps) {
    return (
        <span className={`${friendsBodyFont.className} inline-flex w-fit whitespace-nowrap rounded-full bg-[#f3eeff] px-3 py-1 text-[11px] text-[#6c5ce7] sm:text-[12px]`}>
            {modeLabel}
        </span>
    );
}