import { friendsBodyFont } from "../../friends/fonts";

type RecommendationModeBadgeProps = {
    modeLabel: string; // 지금 만나기/나중에 만나기처럼 현재 추천 모드를 나타내는 라벨입니다.
    emphasized?: boolean;
};

// 추천 요약 카드와 결과 패널에서 공통으로 쓰는 모드 배지입니다.
export function RecommendationModeBadge({ modeLabel, emphasized = false }: RecommendationModeBadgeProps) {
    const isNowMode = modeLabel.includes("지금");
    const emphasizedClassName = isNowMode
        ? "border-[#f59e0b] bg-[linear-gradient(135deg,#fff7cc_0%,#fed7aa_45%,#fdba74_100%)] text-[#7c2d12] shadow-[0_14px_28px_rgba(245,158,11,0.28)]"
        : "border-[#38bdf8] bg-[linear-gradient(135deg,#dbeafe_0%,#bfdbfe_40%,#86efac_100%)] text-[#0f3d91] shadow-[0_14px_28px_rgba(56,189,248,0.24)]";

    return (
        <span className={`${friendsBodyFont.className} inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-[11px] sm:text-[12px] ${emphasized ? `font-extrabold tracking-[-0.01em] ${emphasizedClassName}` : "border-transparent bg-[#f3eeff] text-[#6c5ce7]"}`}>
            {emphasized ? (
                <span className={`h-2 w-2 rounded-full ${isNowMode ? "bg-[#b45309]" : "bg-[#0369a1]"}`} />
            ) : null}
            {modeLabel}
        </span>
    );
}